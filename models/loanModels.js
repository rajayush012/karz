const mongoose = require('mongoose');

const loanSchema =new mongoose.Schema({
    recepient:{
            id: {type: mongoose.Schema.Types.ObjectId,
                required: true, ref:'Users'},
            name: {type: String,
                required: true, ref:'Users'},
            wallet: {type : Number,
            required: true, ref:'Users'}
        },
    collablender: [{
            id: {type: mongoose.Schema.Types.ObjectId,
                required: true, ref: 'Users'},
            name: {type: String,
                required: true, ref: 'Users'},
            wallet: {type : Number,
                    required: true, ref:'Users'}                
        }],
    amtReq:{
        type: Number, required: true
    },
    amtSatisfied:{
        type: Number, required: true
    },
    dateReq:{type: Date},
    dateDue: {type: Date}
})

module.exports = mongoose.model('Loans', loanSchema);