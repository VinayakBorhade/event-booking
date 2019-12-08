const express=require('express');
const bodyParser=require('body-parser');
const graphqlHttp=require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app=express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        // resolvers, nothing but a function
        events: function(){
            return Event
            .find()
            .exec()
            .then(function(events){
                return events.map(function(event){
                    return {...event._doc, _id: event._id };
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
                date: new Date(args.eventInput.date)
            });
            return event.save()
            .then(function(result){
                console.log("result: "+result);
                return {...result._doc, id: result._doc._id.toString() };
            }).catch(function(err){
                console.log("error: "+err);
                throw err;
            });
        }
    },
    graphiql: true
}));
mongoose.connect('mongodb+srv://'+
    process.env.MONGO_USER+':'+
    process.env.MONGO_PASSWORD+
    '@cluster0-vbk75.mongodb.net/'+
    process.env.MONGO_DB+
    '?retryWrites=true&w=majority')
.then(function(){
    app.listen(3000);
}).catch(function(err){
    console.log("error :" + err);
    throw err;
});