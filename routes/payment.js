const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const keyPublishable = 'pk_test_m7ltFnHSd4IR7ItEO0GB80Cx00g1qDTx61';
const keySecret = "sk_test_rQhGlOMNXMMfF0X19pdlekas00ZjP219T3";

const stripe = require("stripe")(keySecret);

router.get('/charge', isLoggedIn,(req,res)=>{
  User.findById(req.user._id,(err,user)=>{
    res.render('payments/recharge',{keyPublishable,user});
  })
    
})

router.post("/charge",isLoggedIn, (req, res) => {
    let amount = req.body.amt;
  
    stripe.customers.create({
      email: req.body.email,
      source: req.body.stripeToken
    })
    .then(customer =>
      stripe.charges.create({
        amount,
        description: "New recharge",
        currency: "inr",
        customer: customer.id
      }))
    .then(charge => {
       
        User.findById(req.user._id,(err,user)=>{
            user.wallet+=charge.amount;
            user.save();
            res.redirect('/user/dashboard');
        });

       
       
    })
    .catch(err => {
      console.log("Error:", err);
      res.status(500).send({error: "Purchase Failed"});
    });
  });

  function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/user/login');
 }
 

module.exports = router;