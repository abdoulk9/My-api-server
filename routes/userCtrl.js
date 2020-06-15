const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncPack = require('async');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

module.exports = {
    register: function (req, res) {
        console.log('in register!!');
        console.log(req.body.email);

        const email = req.body.email,
            username = req.body.username,
            password = req.body.password,
            biography = req.body.biography;

        if (email == null || username == null || password == null) {
            return res.status(400).json({
                'error': 'parameters missing'
            });
        }

        if (username.length >= 15 || username.length <= 3) {
            return res.status(400).json({ 'error': 'Username must be length 4 - 15 ' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'Invalid email!' });
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': ' Invalid password (must be  length 4 - 8  digits and include 1 number  ' });
        }
        /*
        models.User.findOne({
            attributres: ['email'],
            where: {
                email: email
            }
        })
            .then(function (userFound) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                        var newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptedPassword,
                            biography: biography,
                            isAdmin: 0
                        })
                            .then(function (newUser) {
                                return res.status(201).json({ 'userId': newUser.id });
                            })
                            .catch(function (err) {
                                return res.status(500).json({ 'error': 'Can not add new user!' });
                            });
                    });

                } else {
                    return res.status(409).json({
                        'error': 'user already exist'
                    });
                }
            })
            .catch((err) => {
                return res.status(500).json({
                    'error': 'unable to verify this user!'
                })
            }); */

        asyncPack.waterfall([
            function (callback) {
                models.User.findOne({
                    attributres: ['email'],
                    where: {
                        email: email
                    }
                })
                    .then((userFound) => { callback(null, userFound); })
                    .catch((err) => { return res.status(500).json({ 'error': 'Unable to verify this user!' }); });
            },
            function (userFound, callback) {
                if (!userFound) {
                    bcrypt.hash(password, 5, (err, bcryptedPassword) => {
                        callback(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json({ 'error': 'user already exist' });
                }
            },
            function (userFound, bcryptedPassword, callback) {
                var newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    biography: biography,
                    isAdmin: 0
                })
                    .then((newUser) => { callback(newUser); })
                    .catch((err) => { return res.status(500).json({ 'error': 'Can not add new user!' }); });
            }

        ],
            function (newUser) {
                if (newUser) {
                    return res.status(201).json({
                        'userId': newUser.id
                    });
                } else {
                    return res.status(500).json({ 'error': 'Can not add new user!' });
                }
            });
    },

    login: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'Parameter(s) missing(s)!' });
        }

        /* models.User.findOne({
             where: { email: email }
         })
             .then((userFound) => {
                 if (userFound) {
                     bcrypt.compare(password, userFound.password, (errBcrypt, resBcrypt) => {
                         if (resBcrypt) {
                             return res.status(200).json({
                                 'userId': userFound.id,
                                 'token': jwtUtils.generateToken(userFound)
                             });
                         } else {
                             return res.status(403).json({ 'error': 'Invalid password!' });
                         }
                     });
                 } else {
                     return res.status(403).json({ 'error': 'User doesn\'t exist !' });
                 }
             })
             .catch((err) => {
                 return res.status(500).json({ 'error': 'Unable to verify this user!' });
             });*/


        asyncPack.waterfall([
            function (callback) {
                models.User.findOne({
                    where: { email: email }
                })
                    .then((userFound) => {
                        callback(null, userFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({ 'error': 'Unable to verify this user!' });
                    });
            },
            function (userFound, callback) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, (errBcrypt, resBcrypt) => {
                        callback(null, userFound, resBcrypt);
                    });
                } else {
                    return res.status(404).json({ 'error': 'User doesn\'t exist!' });
                }
            },
            function (userFound, resBcrypt, callback) {
               
                if (resBcrypt) {
                    callback(userFound); 
                } else {
                    return res.status(403).json({ 'error': 'Invalid password!' });
                }
            }
        ], function (userFound) {
            if (userFound) {
                return res.status(201).json({
                    'userId': userFound.id,
                    'token': jwtUtils.generateToken(userFound)
                });
            } else {
                return res.status(500).json({ 'error': 'Unable to log this user!' });
            }
        });
    },

    getUserProfil: (req, res) => {

        let headerAuth = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth);

         //console.log(userId);
        if (userId < 0) {
            return res.status(400).json({ 'error': 'Unknow token!' });
        }

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'biography'],
            where: { id: userId }
        }).then((user) => {
            if (user) {
                return res.status(201).json(user);
            } else {
                return res.status(404).json({ 'error': 'User not found !' });
            }
        })
            .catch((err) => {
                return res.status(500).json({ ' error': 'User not fetch !' });
            })
    },

    updateProfil: (req, res) =>{
        let headerAuth = req.headers['authorization'],
            userId = jwtUtils.getUserId(headerAuth);

            let biography = req.body.biography;

            asyncPack.waterfall([
                function(callback){
                    models.User.findOne({
                        attributes: ['id', 'biography'],
                        where :{ id:userId}
                    })
                    .then((userFound) =>{
                        callback(null, userFound);
                    })
                    .catch((err) =>{
                        return res.status(500).json({'error':'Unable to verify this user!'});
                    });
                },
                function(userFound, callback){
                    if(userFound){
                        userFound.update({
                            biography: (biography ? biography: userFound.biography)
                        })
                        .then(() =>{
                            callback(userFound);
                        })
                        .catch((err) =>{
                            res.status(500).json({'error': 'Cannot update user!'});
                        });
                    }else{
                        res.status(400).json({'error':'User not found!'});
                    }
                },
            ], function(userFound){
                if(userFound){
                    return res.status(201).json(userFound);
                }else{
                    return res.status(500).json({'error':'User don\'t update !'});
                }
            })
    }
}