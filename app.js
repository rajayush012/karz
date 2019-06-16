const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/userModels');
const Admin=require('./models/adminModel');
const cors = require('cors');
const userRoutes = require('./routes/user');
const loanRoutes = require('./routes/loan');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const multer = require('multer');

mongoose.connect("mongodb+srv://Alaap:alaap008@cluster0-dzslo.mongodb.net/test?retryWrites=true", function(err) {
    if (err) {
        console.log("Database Not Connected", err);
    } else {
        console.log("Atlas Connected")
    }
});


mongoose.set('useFindAndModify', false);

const port = 3000;
const app = express();



app.use(express.static(__dirname+'/public/'));
app.set('view engine','ejs');
app.use(require('express-session')({
    secret: "Old Monks",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+'/public'));
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passport.use(new localStrategy(Admin.authenticate()));
// passport.serializeUser(Admin.serializeUser());
// passport.deserializeUser(Admin.deserializeUser());
app.use('/user',userRoutes);
app.use('/loan',loanRoutes);
app.use('/admin',adminRoutes);
app.use('/payment',paymentRoutes);
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});



app.use(morgan('dev'));

app.get('/',(req,res)=>{
    res.render('home');
})



app.listen(port, ()=>{
    console.log('Server is up on port: ',port);
});