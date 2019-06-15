const mongoose = require('mongoose');

const loanSchema =new mongoose.Schema({
    recepient:{type:mongoose.Schema.Types.ObjectId,ref: 'User'},
    collablender: [{
            _id: {type: mongoose.Schema.Types.ObjectId,
                 ref: 'User'},
            amtcontrib: {type: Number}
                 
        }],
    interest: {type: Number, required: true},
    amtReq:{type: Number, required: true},
    amtSatisfied:{type: Number, default: 0},
    timeForBid:{type: Number, default: 15},
    dateRequested:{type: Date},
    dateDue: {type: Number},
    dateRemaining: {type:Number},
    status:{type: String, default: 'pending'},
    emi:{type: String}
})

module.exports = mongoose.model('Loans', loanSchema);