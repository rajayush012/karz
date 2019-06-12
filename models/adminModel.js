const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const adminSchema =new mongoose.Schema({
    name : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String, required: true},
})

adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Admins', adminSchema);