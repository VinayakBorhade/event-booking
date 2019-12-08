const express=require('express');
const bodyParser=require('body-parser');
const graphqlHttp=require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const app=express();

const events=[];

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
            return events;
        },
        createEvent: function(args){
            const event= {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date().toISOString()
            };
            console.log(event);
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
}@cluster0-vbk75.mongodb.net/test?retryWrites=true&w=majority`
).then(function(){
    app.listen(3000);
}).catch(function(err){
    console.log(err);
});