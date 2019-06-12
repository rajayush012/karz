const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const cors = require('cors');
mongoose.connect("mongodb+srv://Alaap:alaap008@cluster0-dzslo.mongodb.net/test?retryWrites=true", function(err) {
    if (err) {
        console.log("Database Not Connected", err);
    } else {
        console.log("Atlas Connected")
    }
});

const port = 3000;
const app = express();

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
// passport.use(new localStrategy(Author.authenticate()));
// passport.serializeUser(Author.serializeUser());
// passport.deserializeUser(Author.deserializeUser());

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