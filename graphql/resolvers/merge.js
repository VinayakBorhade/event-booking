const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader(function(eventIds){
    return events(eventIds);
});

const userLoader = new DataLoader(function(userIds){
    return User.find({_id: {$in: userIds}});
});

const events = async (eventIds) => {
    try{
        const eventsResult = await Event.find({_id: {$in: eventIds} });
        eventsResult.sort((a,b)=>{
            return (
                eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
            );
        });
        return eventsResult.map(function(event){
            return transformEvent(event);
        });
    } catch(err){
        throw err;
    }
};

const user = async function(userId){
    try{
        const res = await userLoader.load(userId.toString());
        return {
            ...res._doc,
            _id: res._doc._id,
            createdEvents: () => eventLoader.loadMany(res._doc.createdEvents)  // events(res._doc.createdEvents) 
        };
    } catch(err) {
        console.log(err);
        throw err;
    }
};

const singleEvent = async function(eventId){
    try{
        const event = await eventLoader.load(eventId.toString());
        return event;
    } catch(err) {
        console.log(err);
        throw err;
    }
};

const transformEvent = function(event){
    return {
        ...event._doc,
        _id: event._doc._id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event._doc.creator)
    };
};

const transformBooking = function(booking){
    return {
        ...booking._doc,
        _id: booking._doc._id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;