const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const Loan = require('../models/loanModels')


router.get('/showall',isLoggedIn,(req,res)=>{
    Loan.find({},(err,loans)=>{
        if(err){
            console.log(err);
        }else{
            var filterLoans = loans.filter(loan=>{
                
                return (!loan.recepient.equals(req.user._id));
            })
            res.render('loan/all',{loans:filterLoans});
        }
    });
});

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('loan/newloan');
});

router.post("/new",isLoggedIn,(req,res)=>{
    Loan.create({
        recepient: req.user._id,
        amtReq: req.body.amount,
        dateRequested: Date.now(),
        dateDue: new Date(req.body.date),
    }, (err,loan)=>{
        if(err){
            console.log(err);
            res.redirect('/loan/new');
        }else{
            User.findById(req.user._id,(err,user)=>{
                if(err){
                    console.log(err);
                }else{
                    user.loanreq.push(loan._id);
                    user.save();
                    res.redirect(`/loan/${loan._id}`);
                }
                
            })


           
        }
        
    })
})

router.get('/:loanid',isLoggedIn,(req,res)=>{
    Loan.findById(req.params.loanid,(err,loan)=>{
        res.render('loan/loandetails',{loan:loan});
    })
})

router.get('/:loanid/bid',isLoggedIn,(req,res)=>{
    Loan.findById(req.params.loanid,(err,loan)=>{
        if(err){
            console.log(err);
        }else{
            res.render('loan/bid',{loan});
        }
    });
   
});

router.post('/:loanid/bid',(req,res)=>{
    res.render('loan/bidsuccess');
})

function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/user/login');
 }
 

module.exports = router;
