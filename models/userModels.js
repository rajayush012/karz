const mongoose = require('mongoose');

const userSchema =new mongoose.Schema({
    name : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String, required: true},
    loans: {type: Number, default: 0},
    pendingLoans:{type: Number, default: 0},
    wallet: {type: Number, default: 0},
    
})
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', userSchema);