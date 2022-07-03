const connectionString = process.env.MONGO_URI
const mongoose = require('mongoose');
const { Schema } = mongoose
mongoose.connect(connectionString);
console.log("connected db")
module.exports = {}