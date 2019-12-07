const express=require('express');
const bodyParser=require('body-parser');
const graphqlHttp=require('express-graphql');
const { buildSchema } = require('graphql');

const app=express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String ): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        // resolvers, nothing but a function
        events: function(){
            return ['string 1', 'string 2', 'string 3'];
        },
        createEvent: function(args){
            const eventName=args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.listen(3000);