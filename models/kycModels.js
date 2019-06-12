const mongoose = require('mongoose');

const kycSchema =new mongoose.Schema({
adhaarno:{type: Number, required:true},
adhaarImage: {type: String, required:true},
panno:{type: String, required:true},
panImage: {type:String, required: true},
salary: {type:Number, required: true},
salarySlip:{type:String, required: true},
profile:{type:String}
})

module.exports = mongoose.model('KYC', kycSchema);