const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async function(eventIds){
    eventsResult = await Event.find({_id: {$in: eventIds} });
    try{
        return eventsResult.map(function(event){
            return {
                ...event._doc,
                _id: event._doc._id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event._doc.creator)
            }
        });
    } catch(err){
        throw err;
    }
}

const user = async function(userId){
    try{
        const res = await User.findById(userId)
        return {
            ...res._doc,
            _id: res._doc._id,
            createdEvents: events.bind(this, res._doc.createdEvents)
        };
    } catch(err) {
        console.log(err);
        throw err;
    }
};

const singleEvent = async function(eventId){
    try{
        const event = await Event.findOne({_id: eventId});
        return {
            ...event._doc,
            _id: event._doc._id,
            creator: user.bind(this, event._doc.creator)
        }
    } catch(err) {
        console.log(err);
        throw err;
    }
}

module.exports = {
    // resolvers, nothing but a function
    events: async function(){
        try{
            const events = await Event.find();
            return events.map(function(event){
                return {
                    ...event._doc,
                    _id: event._doc._id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        } catch(err) {
            throw err;
        };
    },
    bookings: async function(){
        try{
            const bookings = await Booking.find();
            return bookings.map(function(booking){
                return {
                    ...booking._doc,
                    _id: booking._doc._id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        } catch(err){
            console.log(err);
            throw err;
        }
    },
    createEvent: async function(args){
        const event=new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5dedbf71fd7fe22174e90325'
        });
        let createdEvent;
        try{
            const result = await event.save();
            console.log("result: "+result);
            createdEvent={
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const userResult = await User.findById('5dedbf71fd7fe22174e90325');        
            if(!userResult){
                throw new Error('User not found');
            }
            userResult.createdEvents.push(event);
            await userResult.save();
            return createdEvent;
        } catch(err){
            console.log("error: "+err);
            throw err;
        };
    },
    createUser: async function(args){
        try{
            const existingUser = await User.findOne({email: args.userInput.email})
            if(existingUser){
                throw new Error('User already exists.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user=new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return {...result._doc, password: null, _id: result._doc._id.toString() };
        } catch(err){
            console.log("error: "+err);
            throw err;
        };
    },
    bookEvent: async function(args){
        try{
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            if(!fetchedEvent){
                const err =new Error('No such event exists');
                throw err;
            }
            const booking = new Booking({
                user: '5dedbf71fd7fe22174e90325',
                event: fetchedEvent
            });
            const bookingResult=await booking.save();
            return {
                ...bookingResult._doc,
                _id: bookingResult._doc._id,
                user: user.bind(this, booking._doc.user),
                event: singleEvent.bind(this, booking._doc.event),
                createdAt: new Date(bookingResult._doc.createdAt).toISOString(),
                updatedAt: new Date(bookingResult._doc.updatedAt).toISOString()
            }
        } catch(err) {
            console.log(err);
            throw err;
        }
    },
    cancelBooking: async function(args){
        try{
            const fetchedBooking = await Booking.findById(args.bookingId).populate('event');
            if(!fetchedBooking){
                const err = new Error('No such booking exists');
                throw err;
            }
            const event = {
                ...fetchedBooking.event._doc,
                _id: fetchedBooking.event._doc._id,
                creator: user.bind(this, fetchedBooking.event.creator)
            };
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch(err) {
            console.log(err);
            throw err;
        }
    }
}