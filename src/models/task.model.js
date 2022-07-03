const mongoose = require("mongoose")
const {
    Schema
} = mongoose;
const Joi = require("joi");

const enumStatus = {
    New: 0,
    Active: 1,
    Done: 2
}

const taskSchema = new Schema({
    title: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    // owner: {
    //     type: mongoose.Types.ObjectId,
    //     ref: "User"
    // },
    owner: Joi.string().meta({
        _mongoose: {
            type: "ObjectId",
            ref: "User"
        },
    }),
    status: Joi.number().valid(...Object.values(enumStatus)).default(0),
    createdAt: Joi.number().default(() => Math.floor(Date.now() / 1000))
});


const Task = mongoose.model('Task', taskSchema);
module.exports = Task