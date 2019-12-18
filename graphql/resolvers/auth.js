const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
    // resolvers, nothing but a function
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
    login: async function({email, password}){
        console.log("login called");
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error('User does not exist');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            throw new Error('Incorrect password');
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, process.env.JWT_KEY, {
            expiresIn: '1h'
        });
        return {
            userId: user.id,
            token: token,
            tokenExpiration: 1
        };
    }
}