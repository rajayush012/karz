const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const Loan = require('../models/loanModels');
const multer = require('multer');
const Kyc=require('../models/kycModels');
const fs = require('fs-extra');
const util = require('util');
const bts = require('base64-to-image');

var storage = multer.diskStorage({
    destination: 'public/userAssets/uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.jpg')
    }
})

var uploadtest = multer({limits: {fileSize: 2000000 },dest:'/uploads/'}) 

router.get('/test',isLoggedIn,(req,res)=>{
    res.render('test');
});

router.post('/test',uploadtest.single('pic1'),(req,res)=>{
    if(req.file == null){
        res.render('/test',{message: 'Upload!'});
    }else{
        var newImg = fs.readFileSync(req.file.path);
        var encImg = newImg.toString('base64');
       
        User.findById(req.user._id,(err,user)=>{
            user.profilePic = encImg;
            user.save();
            fs.remove(req.file.path,(err)=>{
                res.render('success');
            })
        });
    }
});

router.get('/all',(req,res)=>{
    User.find({},(err,users)=>{
        res.send(users);
    })
})

router.get('/final',isLoggedIn,(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
      res.render('final',{user});
    })
})

var storageKyc = multer.diskStorage({
    destination: 'public/userAssets/uploads/kyc',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.jpg')
    }
})
var upload = multer({ storage: storage })

var uploadKyc = multer({ storage: storageKyc })


router.post('/flush/:id',(req,res)=>{
    User.findById(req.params.id, (err,user)=>{
        user.wallet -= req.body.trans;
        if(user.wallet >= 0)
            user.save();
    })
    res.redirect('/user/dashboard');
})

router.get('/new',(req,res)=>{
    message ="";
    res.render('user/signup',{message});
});


router.post('/new',uploadtest.single('file'),(req,res)=>{
  // console.log(req.file);

    if(req.file== null){
        res.render('user/signup',{message: "Complete all fields"});
    }else{
        var newImg = fs.readFileSync(req.file.path);
        var encImg = newImg.toString('base64');
        var orgs = req.body.orgs.split(',');
    var newUser = new User({
        username: req.body.username,
        name: req.body.name, 
        email: req.body.email,
        profilePic: encImg,
        dob: req.body.dob,
        currentDesignation: req.body.curdesig,
        educationalQualiication: req.body.edu,
        organizations: orgs,
        gender: req.body.gender   
    });
    User.register(newUser,req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect('user/new');
        }
        passport.authenticate("local")(req,res, ()=>{
        res.redirect(`/user/dashboard`)
        })
    } );
    }
})

router.get ('/kyc',isLoggedIn,(req,res)=>{
    res.render('user/kyc',{message:""});
})

router.post('/kyc',isLoggedIn,uploadtest.fields([
    { name:'adhaarImage' ,maxCount:1 },
    { name:'panImage' ,maxCount:1 },
    { name:'salarySlip' ,maxCount:1 }
]),(req,res)=>{

    if(req.files == null){
        res.render('user/kyc',{message:'Upload all images'})
    }
    else{
        var newAdhaar = fs.readFileSync(req.files.adhaarImage[0].path);
        var encAd = newAdhaar.toString('base64');
        var newPan = fs.readFileSync(req.files.panImage[0].path);
        var encPa = newPan.toString('base64');
        var newSal = fs.readFileSync(req.files.salarySlip[0].path);
        var encSal = newSal.toString('base64');
        Kyc.create({
            adhaarno:req.body.adhaarno,
            panno: req.body.panno,
            salary: req.body.salary,
            profile: req.body.profile,
            adhaarImage: encAd,
            panImage: encPa,
            salarySlip :encSal 
        },(err,kyc)=>{
    
            if(err){
                console.log(err);
            }
           // console.log(kyc);
            fs.remove(req.files.adhaarImage[0].path,(err)=>{
                fs.remove(req.files.panImage[0].path,(err2)=>{
                    fs.remove(req.files.salarySlip[0].path,(err3)=>{
                        User.findById(req.user._id,(err,user)=>{
                            user.kyc=kyc._id;
                            user.save();
                            res.redirect('/user/dashboard');
                        })        
                        
                    })
                })
            })
           
        })
    }

    
});



router.get('/dashboard',isLoggedIn,(req,res)=>{
    
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
        }else{
           // console.log(user.profilePic.substring(6));
            Loan.find({recepient: req.user._id, status: 'pending'},(err,pendingLoans)=>{
               // console.log(pendingLoans);
                if(err){
                    console.log(err);
                }else{
                    Loan.find({recepient: req.user._id, status: 'accepted'},(err,acceptedLoans)=>{

                        if(err){
                            console.log(err);
                        }else{
                            Loan.find({"collablender._id": req.user._id},(err,collabLoans)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                    res.render('user/dashboard/dashboard',{user:user, collabLoans:collabLoans , acceptedLoans:acceptedLoans , pendingLoans:pendingLoans});
                                }
                            })
                        }

                    })
                }

            })

          //  res.render('user/dashboard/dashboard',{user:user});
        }
    })
})

router.get('/login',(req,res)=>{
    res.render('user/login')
});


router.post('/login',passport.authenticate("local",{
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login"
}),(req,res)=>{
    
});

router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
})

router.get('/profile/:id',isLoggedIn,(req,res)=>{
User.findById(req.params.id,(err,user)=>{
    User.findById(req.user._id,(err,loguser)=>{
        res.render('user/dashboard/user',{user:user,luser:loguser});
    })
   
});
    
})

function isLoggedIn(req,res,next){
    // console.log(req.isAuthenticated());
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect('/user/login');
 }
 
module.exports = router;