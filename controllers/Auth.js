// install bcrypt
const bcrypt = require("bcryptjs")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
require("dotenv").config()


exports.register = async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, password, confirmPassword } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(500).json({
                success: false,
                error:error,
                message: "User already registered"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"Password do not match!!!"
            })
        }

        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 10)
        } catch (error) {
            res.status(500).json({
                success: false,
                error:error,
                message: "Error in hashing password..."
            })
        }
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
        })
        return res.status(200).json({
            success:true,
            user:newUser,
            message:"User created successgfully..."
        })


    } catch (error) {
        console.log(error)
        console.error(error)
        return res.status(500).json({
            success:false,
            error:error,
            message:"User not registered, Please try again Later...."
        })
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({
                success:false,
                message:"Please fill all the details carefully..."
            })
        }
        // check for the user
        const user = await User.findOne({email})
        // if user does not exist
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered!!!"
            })
        }

        const payload = {
            email:user.email,
            id:user._id,
        }
        // verify the password & generate the JWT token
        if(await bcrypt.compare(password, user.password)) {
            // password match
            let token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h"
            })
            
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true
            }
            console.log("Login: ", user)
            return res.status(200).json({
                success:true,
                user: { ...user.toObject(), token },
                token:token,
                message:"Login successful"
            })
        }
        else{
            // password do not match
            return res.status(403).json({
                success:false,
                message:"Password does not match."
            })
        }

    } catch (error) {
        console.log(error)
        console.error(error)
        return res.status(500).json({
            success:false,
            error:error,
            message:"Login unsuccessful"
        })
    }
}

exports.protect = async (req, res, next) => {
    try {
        let token
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }
        if(!token) {
            return res.status(401).json({
                success:false,
                message:"You are not authorized to access this route..."
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if(!user) {
            return res.status(404).json({
                success:false,
                message:"User not found..."
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        console.error(error)
        return res.status(500).json({
            success:false,
            error:error,
            message:"User not authorized..."
        })
    }
}