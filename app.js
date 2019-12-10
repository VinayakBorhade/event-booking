const express=require('express');
const bodyParser=require('body-parser');
const graphqlHttp=require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

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

        type User{
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
                date: new Date(args.eventInput.date),
                creator: '5dedbf71fd7fe22174e90325'
            });
            let createdEvent;
            return event.save()
            .then(function(result){
                console.log("result: "+result);
                createdEvent={...result._doc, id: result._doc._id.toString() };
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
                return {...result._doc, password: null, _id: result.id };
            })
            .catch(function(err){
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