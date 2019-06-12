const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const Admin= require('../models/adminModel');
const passport = require('passport');

router.get('/new',(req,res)=>{
    res.render('admin/newadmin')
});

router.post('/new',(req,res)=>{
    var newAdmin = new Admin({username: req.body.username, name: req.body.name});
    Admin.register(newAdmin,req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect('/')
        }
        passport.authenticate("local")(req,res, ()=>{
        res.redirect(`admin/dashboard`)
        })
    } );

})

router.get('/dashboard',isLoggedIn,(req,res)=>{
    Admin.findById(req.user._id,(err,admin)=>{
        if(err){
            console.log(err);
        }else{
            res.render('admin/dashboard',{admin:admin});
        }
    })
})

router.get('/login',(req,res)=>{
    res.render('admin/login')
});


router.post('/login',passport.authenticate("local",{
    successRedirect: "admin/dashboard",
    failureRedirect: "admin/login"
}),(req,res)=>{
    
});

router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
})

function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/login');
 }
 

module.exports = router;