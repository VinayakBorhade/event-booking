const Event = require('../../models/event');
const { transformEvent } = require('./merge');
const User = require('../../models/user');

module.exports = {
    // resolvers, nothing but a function
    events: async function(){
        try{
            console.log("events called");
            const events = await Event.find();
            return events.map(function(event){
                return transformEvent(event);
            });
        } catch(err) {
            throw err;
        };
    },
    createEvent: async function(args, req){
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        const event=new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;
        try{
            const result = await event.save();
            createdEvent=transformEvent(result);
            const userResult = await User.findById(req.userId);
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
    }
}