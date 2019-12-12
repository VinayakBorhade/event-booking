const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async function(eventIds){ 
    events = await Event.find({_id: {$in: eventIds} });
    try{
        return events.map(function(event){
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
            _id: res.id,
            createdEvents: events.bind(this, res._doc.createdEvents)
        };
    } catch(err) {
        console.log(err);
    }
};

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
            console.log("result: " + result);
            return {...result._doc, password: null, _id: result._doc._id.toString() };
        } catch(err){
            console.log("error: "+err);
            throw err;
        };
    }
}