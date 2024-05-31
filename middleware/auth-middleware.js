const jwt = require('jsonwebtoken')
const userModel =require('../models/users')

var checkUserAuth = async(req,resp,next)=>{
    let token
    const{authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            // get token from header
            token =  authorization.split(' ')[1]

            // verify toekn
            const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY)

            // get user from token
            req.user = await userModel.findById(userID).select('-password')
            next()
        } catch (error) {
            resp.send({"status":"failed", "message":"unauthorised user"})
        }
    }
    if(!token){
        resp.send({"status":"failed", "message":"unauthorised user, no token"})

    }

}

module.exports = checkUserAuth