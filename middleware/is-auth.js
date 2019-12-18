const jwt=require('jsonwebtoken');

module.exports = function(req, res, next){
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth=false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    if(!token || token==''){
        console.log('token: ', token);
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
        return next();
    }
    req.isAuth=false;
    req.userId=verifiedToken.userId;
    next();
};