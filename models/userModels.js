const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema =new mongoose.Schema({
    name : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String},
    loans: {type: Number, default: 0},
    pendingLoans:{type: Number, default: 0},
    loanreq:[{type: mongoose.Schema.Types.ObjectId}],
    wallet: {type: Number, default: 100},
    
})
userSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', userSchema);