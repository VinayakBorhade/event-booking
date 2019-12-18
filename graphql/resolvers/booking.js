const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge');

module.exports = {
    // resolvers, nothing but a function    
    bookings: async function(args, req){
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        try{
            const bookings = await Booking.find();
            return bookings.map(function(booking){
                return transformBooking(booking);
            });
        } catch(err){
            console.log(err);
            throw err;
        }
    },
    bookEvent: async function(args, req){
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        try{
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            if(!fetchedEvent){
                const err =new Error('No such event exists');
                throw err;
            }
            const booking = new Booking({
                user: req.userId,
                event: fetchedEvent
            });
            const bookingResult=await booking.save();
            return transformBooking(bookingResult);
        } catch(err) {
            console.log(err);
            throw err;
        }
    },
    cancelBooking: async function(args, req){
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        try{
            const fetchedBooking = await Booking.findById(args.bookingId).populate('event');
            if(!fetchedBooking){
                const err = new Error('No such booking exists');
                throw err;
            }
            const event = transformEvent(fetchedBooking.event);
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch(err) {
            console.log(err);
            throw err;
        }
    }
}