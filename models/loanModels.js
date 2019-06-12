const mongoose = require('mongoose');

const loanSchema =new mongoose.Schema({
    recepient:{
            _id: {type: mongoose.Schema.Types.ObjectId,
                 ref:'Users'}
        },
    collablender: [{
            _id: {type: mongoose.Schema.Types.ObjectId,
                 ref: 'Users'}
                 
        }],
    amtReq:{
        type: Number, required: true
    },
    amtSatisfied:{
        type: Number, default: 0
    },
    dateRequested:{type: Date},
    dateDue: {type: Date},
    status:{type: String, default: 'pending'}
})

module.exports = mongoose.model('Loans', loanSchema);