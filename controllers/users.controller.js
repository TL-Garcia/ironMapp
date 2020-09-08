const mongoose = require('mongoose');
const User = require('../models/user.model');
const mailer = require('../configs/mailer.config');
const passport = require('passport');


const validationError = {
    error: {
        validation: {
            message: 'Wrong Credentials'
        }
    }
};

module.exports.renderLogin = (req, res, next) => {
    res.render('users/login');
};

module.exports.renderSignup = (req, res, next) => {
    res.render('users/signup');
};

module.exports.createUser = (req, res, next) => {
    const user = new User({
        ...req.body,
        avatar: req.file ? req.file.path : undefined
    });
    console.log(user)

    user.save()
        .then(user => {
            mailer.sendValidationEmail({
                name: user.username,
                email: user.email,
                id: user._id.toString(),
                activationToken: user.status.token
            });

            res.render('users/login', {
                message: 'Check your email for activation'
            });
        })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                res.render("users/signup", {
                    error: error.errors,
                    user
                });
            } else if (error.code === 11000) { // error when duplicated user
                res.render("users/signup", {
                    user,
                    error: {
                        email: {
                            message: 'user already exists'
                        }
                    }
                });
            } else {
                next(error);
            }
        })
        .catch(next);
};

module.exports.activateUser = (req, res, next) => {
    User.findOne({
            "status.token": req.params.token
        })
        .then(user => {
            if (user) {
                user.status.active = true;
                user.save()
                    .then(newUser => {
                        res.render('users/login', {
                            message: 'Your account has been activated, log in below!'
                        });
                    })
                    .catch(error => next);
            } else {
                res.render('users/login', {
                    message: 'Invalid link'
                });
            }

        })

        .catch(error => next);
};

module.exports.renderLogin = (req, res, next) => {
    res.render('users/login');
};

module.exports.doLogin = (req, res, next) => {
    User.findOne({
            username: req.body.username
        })
        .then(user => {
            if (user) {
                user.checkPassword(req.body.password)
                    .then(match => {
                        if (match) {
                            //should check for activation
                            req.session.userId = user._id;
                            res.redirect('/users/dashboard');
                        } else {
                            res.render('users/login', validationError);
                        }
                    })
                    .catch(next);
            } else {
                res.render('users/login', validationError);
            }
        });
};

module.exports.doLogout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
};

module.exports.renderSignup = (req, res, next) => {
    res.render('users/signup');
};

module.exports.renderDashboard = (req, res, next) => {
    res.render('users/dashboard', req.currentUser);
};

module.exports.renderEditForm = (req, res, next) => {
    const id = req.params;

    User.findById(id)
        .then( userToEdit => {
            res.render('users/user-edit', userToEdit);
        })
        .catch(error => next);
};

module.exports.updateUser = (req, res, next) => {
    console.log(req.file)
    const { username, email, password, avatar } = req.body;

    const updatedUser = {
        username,
        email
    }
    if (req.file) {
        updatedUser.avatar = req.file.path
    }
    if (password) {
        updatedUser.password = password
    }

    console.log(updatedUser)

    User.findByIdAndUpdate(req.params._id, updatedUser, { runValidators: true, new: true })
        .then(user => {
            console.log(user)
            if (user) {
                res.redirect('/users/dashboard')
            } else {
                res.render(`/users/${user._id}/edit`, {
                    error: {
                        validation: {
                            message: 'Your account is not active, check your email!'
                        }
                    }
                })
            }
        })
    .catch(error => next)
}
