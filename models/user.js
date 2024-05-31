const mongoose = require('mongoose')
const {Schema}=mongoose;
const UserSchema =new Schema ({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true

    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    friendRequests: [{ type: String , ref: 'email' }],
    friends: [{ type: String , ref: 'email' }]
});
module.exports =mongoose.model('user',UserSchema);