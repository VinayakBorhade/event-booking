const jwt=require('jsonwebtoken');

module.exports = function(req, res, next){
    const authHeader = req.get('Authorization');
    console.log('header; ', authHeader);
    if(!authHeader){
        req.isAuth=false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    // console.log('token ', token);
    if(!token || token==''){
        req.isAuth=false;
        return next();
    }
    let verifiedToken;
    try{
        verifiedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch(err){
        req.isAuth=false;
        return next();
    }
    if(verifiedToken){
        req.isAuth=true;
        req.userId=verifiedToken.userId;
        console.log('inside is-auth , req.userId; ', req.userId);
        return next();
    }
    req.isAuth=false;
    next();
};