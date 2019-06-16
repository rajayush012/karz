const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const Admin = require('../models/adminModel');
const Kyc = require('../models/kycModels');

router.get('/new',(req,res)=>{
    res.render('admin/newadmin')
});

router.post('/new',(req,res)=>{   
    var newUser = new User({username: req.body.username, name: req.body.name, isAdmin: 'yes'});
    User.register(newUser,req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect('/')
        }
        passport.authenticate("local")(req,res, ()=>{
        res.redirect(`/admin/dashboard`);
        })
    } );

});

router.post('/login',passport.authenticate("local",{
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login"
}),(req,res)=>{
    
});

router.get('/login',(req,res)=>{
    res.render('admin/login');
});


router.get('/dashboard',isAdminAndLoggedIn,(req,res)=>{
    User.find({},(err,users)=>{
        var filteredUsers = users.filter(user=>{
            return (!user._id.equals(req.user._id))&&(user.isAdmin==='no');
        })
        filteredUsers.reverse();
        User.findById(req.user._id,(err,user)=>{
            res.render('admin/adminHome',{users: filteredUsers,user:user});
        })
        
    })
    
})

router.post('/kyc/delete/:kycid/user/:userid',isAdminAndLoggedIn,(req,res)=>{
    Kyc.findById(req.params.kycid,(err,kyc)=>{
        User.findById(req.params.userid,(err,user)=>{
            user.kyc = null;
            user.save();
            res.redirect('/admin/dashboard');

        })
    })
})

router.get('/verify/:userid',isAdminAndLoggedIn,(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        User.findById(req.params.userid,(err,veri)=>{
          //  console.log(veri.kyc);
            Kyc.findById(veri.kyc,(err,kyc)=>{
                if(err){
                    console.log(err);
                }
                //console.log(kyc);
                res.render('admin/verify',{user:user,verifye:veri, kyc:kyc});
            })
           
        })
        
    })
    
})

router.post('/verify/:userid',(req,res)=>{
    User.findById(req.params.userid,(err,user)=>{
        user.kycstatus = 'approved';
        user.save();
        res.redirect('/admin/dashboard');
    })
})

function isAdminAndLoggedIn(req,res,next){
    if(req.isAuthenticated()){
       if(req.user.isAdmin === 'yes'){
        return next();
       }
        else{
            res.redirect('/admin/login');
        }
    }
    res.redirect('/admin/login');
}




function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/login');
 }
 



module.exports = router;