const express=require('express');
const bodyParser=require('body-parser');
const graphqlHttp=require('express-graphql');
const mongoose = require('mongoose');
const morgan = require('morgan');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app=express();

app.use(bodyParser.json());

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
});

app.use(morgan('dev'));
app.use(isAuth);

app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    // graphiql: true
}));
mongoose.connect('mongodb+srv://'+
    process.env.MONGO_USER+':'+
    process.env.MONGO_PASSWORD+
    '@cluster0-vbk75.mongodb.net/'+
    process.env.MONGO_DB+
    '?retryWrites=true&w=majority')
.then(function(){
    app.listen(8000);
    console.log('backend-server started on port 8000');
}).catch(function(err){
    console.log("error :" + err);
    throw err;
});