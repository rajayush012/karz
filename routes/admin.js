const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const Admin = require()

router.get('/new',(req,res)=>{
    res.render('admin/newadmin')
});

router.post('/new',(req,res)=>{   
    var newUser = new User({username: req.body.username, name: req.body.name, isAdmin: 'Yes'});
    User.register(newUser,req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect('/')
        }
        passport.authenticate("local")(req,res, ()=>{
        res.render(`admin/continue`);
        })
    } );

})
router.post('/newAdmin',(req,res)=>{
    Admin.create
})



function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/login');
 }
 

module.exports = router;