const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const jwt_secret = process.env.jwtSecret; 


const fetchuser =(req,res,next)=>{

    const token =req.header('auth-token');
    if(!token){
        res.status(401).send({error: "please use vaild token1"})
    }
    try{
        const data =jwt.verify(token,jwt_secret);
    req.user=data.user;
    next();
    }
    catch{
        res.status(401).send({error: "please use vaild token2"})
    }
}


module.exports = fetchuser;
