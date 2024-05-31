const mongoose = require('mongoose')
const { type } = require('os')

// defining schema

const userSchema = new mongoose.Schema({
    name:{type:String, required: true, trim: true},
    email:{type:String, required: true, trim: true},
    password:{type:String, required: true,  trim: true,default:''},
    role:{type:String, required: true, trim: true},
    isActive:{type:Boolean, default: true, trim: true},
    img:{type:String},
})

// Model

const userModel = mongoose.model("user", userSchema)

module.exports = userModel