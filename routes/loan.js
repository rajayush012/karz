const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModels');
const passport = require('passport');
const Loan = require('../models/loanModels')


router.get('/showall', isLoggedIn, (req, res) => {
    Loan.find({}, (err, loans) => {
        if (err) {
            console.log(err);
        } else {
            var filterLoans = loans.filter(loan => {

                return (!loan.recepient.equals(req.user._id));
            })
            res.render('loan/all', { loans: filterLoans });
        }
    });
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('loan/newloan');
});

router.post("/new", isLoggedIn, (req, res) => {
    Loan.create({
        recepient: req.user._id,
        amtReq: req.body.amount,
        dateRequested: Date.now(),
        dateDue: req.body.date,
        dateRemaining: req.body.date,
    }, (err, loan) => {
        if (err) {
            console.log(err);
            res.redirect('/loan/new');
        } else {
            User.findById(req.user._id, (err, user) => {
                if (err) {
                    console.log(err);
                } else {
                    user.loanreq.push(loan._id);
                    user.save();
                    res.redirect(`/loan/${loan._id}`);
                }

            })

        }

    })
})

router.get('/:loanid', isLoggedIn, (req, res) => {
    Loan.findById(req.params.loanid, (err, loan) => {
        res.render('loan/loandetails', { loan: loan });
    })
})

router.get('/:loanid/bid', isLoggedIn, (req, res) => {
    Loan.findById(req.params.loanid, (err, loan) => {
        if (err) {
            console.log(err);
        } else {
            res.render('loan/bid', { loan });
        }
    });

});

router.post('/:loanid/bid', (req, res) => {
    Loan.findById(req.params.loanid, (err, loan) => {
        if (err) {
            console.log(err);
        } else {
            if (req.body.amount <= (loan.amtReq - loan.amtSatisfied) && req.body.amount !== 0) {

                User.findById(req.user._id, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else {

                        if (user.wallet >= req.body.amount) {
                            loan.collablender.push({ _id: user._id, amtcontrib: req.body.amount })
                            let newsat = parseInt(loan.amtSatisfied) + parseInt(req.body.amount);
                            loan.amtSatisfied = newsat;
                            if (loan.amtSatisfied == loan.amtReq) {
                                //console.log(loan.status);
                                loan.status = 'accepted';
                                User.findById(loan.recepient, (err, user) => {
                                    if (err) {
                                        console.log(user);
                                    } else {
                                        user.wallet += loan.amtReq;
                                    }

                                });
                            }
                            user.wallet = parseInt(user.wallet) - parseInt(req.body.amount);
                            loan.save();
                            user.save();
                            res.render('loan/bidsuccess');
                        }
                        else {
                            res.redirect('/loan/showall');
                        }


                    }
                })



            }
            else {
                res.redirect('/loan/', req.params.loanid);
            }


        }
    })

})

function isLoggedIn(req, res, next) {
    // console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
}

var dayDuration = 5000;

var interTimer = setInterval(() => {
    Loan.find({ status: 'pending' }, (err, loans) => {
        if (err) {
            console.log(err);
        } else {
            if (loans.length !== 0) {
                loans.forEach(loan => {
                    if (loan.timeForBid <= 0) {
                        loan.status = 'declined';
                    }
                    (async () => {
                        loan.timeForBid -= 1;
                    })();

                    loan.save();
                })
            } else {
                clearInterval(interTimer);
            }

        }

    });

   
}, dayDuration);

const interestRate = 0.12;

var installTimer = setInterval(() => {
    Loan.find({ status: 'accepted' }, (err, loans) => {
        if (err) {
            console.log(err);
        } else {
            if (loans.length !== 0) {
                loans.forEach(loan => {
                    if(loan.dateRemaining<0){
                        loan.status='paid';
                    }
                    (async () => {
                        loan.dateRemaining -= 1;
                        User.findById(loan.recepient._id,(err,user)=>{
                            if(err){
                                console.log(err);
                            }else{
                               //logic for wallet deduction
                               (async ()=>{
                                user.wallet -= ((loan.amtReq)+((loan.amtReq*interestRate*loan.dateDue)/12))/loan.dateDue;
                               })();
                                user.save();
                               //logic for distribution of interest money to contributors
                               loan.collablender.forEach(payee=>{
                                   User.findById(payee._id, (err,paye)=>{
                                    paye.wallet += (((loan.amtReq)+((loan.amtReq*interestRate*loan.dateDue)/12))/loan.dateDue)*(payee.amtcontrib/loan.amtReq);
                                    paye.save();
                                   });
                               })
                            }
                        })
                    })();

                    loan.save();
                })
            } else {
                clearInterval(installTimer);
            }

        }

    });

   
}, dayDuration*30);

module.exports = router;
