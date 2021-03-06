const User = require('../models/user.model');


module.exports.isAuthenticated = (req, res, next) => {
  if (req.currentUser && req.currentUser.status.active) {
    next();
  } else if (req.currentUser) {
    res.render('users/verification');
  } else {
    //should flash an auth warning
    res.redirect('/login');
  }
};

module.exports.isNotAuthenticated = (req, res, next) => {
  if (!req.currentUser) {
    next();
  } else {
    //should flash "you're already logged in"
    res.redirect('/users/dashboard');
  }
};

module.exports.checkAuth = (req, res, next) => {
  User.findById(req.session.userId)
    .then(user => {
      if (user) {
        req.currentUser = user;
        res.locals.currentUser = user;

        next();
      } else {
        next();
      }
    });
};

module.exports.isAuthor = (req, res, next) => {
  const ownerId = req.params.ownerId;
  if (req.currentUser.id === ownerId) {
    next();
  } else {
    console.error('Auth error');
  }
};