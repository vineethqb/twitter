'use strict';

module.exports = function(app) {
    app.set('view engine', 'ejs');
    var router = app.loopback.Router();
    router.get('/', function(req, res, next) {
        res.render('index');
    });
    router.get('/register', function(req, res, next) {
        res.render('register');
    });
    router.get('/home', function(req, res, next) {
        res.render('home');
    });
    router.get('/profile', function(req, res, next) {
        res.render('profile');
    });
    router.get('/email', function(req, res, next) {
        res.render('index');
    });
    router.get('/address', function(req, res, next) {
        res.render('index');
    });
    router.get('/account', function(req, res, next) {
        res.render('index');
    });
    app.use(router);
};
