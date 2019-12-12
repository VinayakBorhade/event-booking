const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = function(eventIds){ 
    return Event.find({_id: {$in: eventIds} })
    .then(function(events){
        return events.map(function(event){
            return {
                ...event._doc,
                _id: event._doc._id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event._doc.creator)
            }
        });
    })
    .catch(function(err){
        throw err;
    });
}

const user = function(userId){
    return User.findById(userId)
    .then(function(res){
        return {
            ...res._doc,
            _id: res.id,
            createdEvents: events.bind(this, res._doc.createdEvents)
        };
    }).catch(function(err){
        throw err;
    });
};

module.exports = {
    // resolvers, nothing but a function
    events: function(){
        return Event
        .find()
        .exec()
        .then(function(events){
            return events.map(function(event){
                return {
                    ...event._doc,
                    _id: event._doc._id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        }).catch(function(err){
            throw err;
        });
    },
    createEvent: function(args){
        const event=new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5dedbf71fd7fe22174e90325'
        });
        let createdEvent;
        return event.save()
        .then(function(result){
            console.log("result: "+result);
            createdEvent={
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            return User.findById('5dedbf71fd7fe22174e90325');
        })
        .then(function(user){
            if(!user){
                throw new Error('User not found');
            }
            user.createdEvents.push(event);
            return user.save();
        })
        .then(function(result){
            return createdEvent;
        })
        .catch(function(err){
            console.log("error: "+err);
            throw err;
        });
    },
    createUser: function(args){
        return User.findOne({email: args.userInput.email}).then(function(user){
            if(user){
                throw new Error('User already exists.');
            }
            return bcrypt.hash(args.userInput.password, 12);
        })
        .then(function(hashedPassword){
            const user=new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(function(result){
            console.log("result: " + result);
            return {...result._doc, password: null, _id: result._doc._id.toString() };
        })
        .catch(function(err){
            console.log("error: "+err);
            throw err;
        });
    }
}