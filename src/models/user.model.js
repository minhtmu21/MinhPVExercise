const mongoose = require("mongoose")
const { Schema } = mongoose;
const Joi = require('joi');

const enumStatus = {Unactive: 0, Active: 1}
const taskSchema = new Schema({
    name: Joi.string().max(30),
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(3).max(20).required(),
    active: Joi.number().valid(...Object.values(enumStatus)).default(1),
    createdAt: Joi.number().default(() => Math.floor(Date.now() / 1000))
});


const User = mongoose.model('User', taskSchema);
module.exports = User