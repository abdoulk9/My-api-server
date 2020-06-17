const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');
const asyncPack = require('async');

const LIKED = 1, DISLIKED = 0;

module.exports = {
    likePost : (req, res) => {
        let headersAuth = req.headers['authorization'];
        let userId = jwtUtils.getId(headersAuth);

        let messageId = parseInt(req.params.messageId);

        if (messageId <= 0) {
            return res.status(400).json({ 'error': ' Parameter invalid !' });
        }

        asyncPack.waterfall([
            function (callback) {
                models.Message.findOne({
                    where: { id: messageId }
                })
                    .then((msgFound) => {
                        callback(null, msgFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({ 'error': 'Cannot verify message !' });
                    });
            },
            function (msgFound, callback) {
                if (msgFound) {
                    models.User.findOne({
                        where: { id: userId }
                    })
                        .then((userFound) => {
                            callback(null, msgFound, userFound);
                        })
                        .catch((err) => {
                            return res.status(500).json({ 'error': ' Canot verify user !' });
                        });
                } else {
                    res.status(404).json({ 'error': 'message already liked ! ' });
                }
            },
            function (msgFound, userFound, callback) {
                if (userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            messageId: messageId
                        }
                    })
                        .then((userAlreadyLiked) => {
                            callback(null, msgFound, userFound, userAlreadyLiked);
                        })
                        .catch((err) => {
                            res.status(500).json({ ' error': ' Cannot check is user already liked !' });
                        })
                } else {
                    res.status(404).jsin({ ' error': ' User not found ! ' });
                }
            },
            function (msgFound, userFound, userAlreadyLiked, callback) {
                if (!userAlreadyLiked) {
                    msgFound.addUser(userFound, { isLike: LIKED })
                        .then((alreadyLiked) => {
                            callback(null, msgFound, userFound);
                        })
                        .catch((err) => {
                            res.status(500).json({ 'error': 'Cannot add user\'s comment !' });
                        });
                } else {
                    if (userAlreadyLiked.isLike === DISLIKED) {
                        userAlreadyLiked.update({
                            isLike: LIKED
                        })
                            .then(() => {
                                callback(null, msgFound, userFound);
                            })
                            .catch((err) => {
                                res.status(500).json({ 'error': 'Cannot update comment ! ' });
                            });
                    } else {
                        return res.status(409).json({ 'error': ' already commented !' });
                    }
                }
            },
            function (msgFound, userFound, callback) {
                msgFound.update({
                    likes: msgFound.likes + 1
                })
                    .then(() => {
                        callback(msgFound);
                    })
                    .catch((err) => {
                        res.status(500).json({ 'error': 'Impossible to update likes counter ! ' });
                    });
            },
        ], function (msgFound) {
            if (msgFound) {
                res.status(201).json(msgFound);
            } else {
                res.status(500).json({ 'error': ' Comment no update !' });
            }
        });
    },

    dislikePost: (req, res) => {

        let headersAuth = req.headers['authorization'];
        let userId = jwtUtils.getId(headersAuth);

        let messageId = parseInt(req.params.messageId);
        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'Paramaters invalid !' });
        }


        asyncPack.waterfall([
            function (callback) {
                models.Message.findOne({
                    where: { id: messageId }
                })
                    .then((msgFound) => {
                        callback(null, msgFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({ 'error': 'Cannot verify message !' });
                    });
            },
            function (msgFound, callback) {
                if (msgFound) {
                    models.User.findOne({
                        where: { id: userId }
                    })
                        .then((userFound) => {
                            callback(null, msgFound, userFound);
                        })
                        .catch((err) => {
                            return res.status(500).json({ 'error': ' Canot verify user !' });
                        });
                } else {
                    res.status(404).json({ 'error': 'Post already liked ! ' });
                }
            },
            function (msgFound, userFound, callback) {
                if (userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            messageId: messageId
                        }
                    })
                        .then((userAlreadyLiked) => {
                            callback(null, msgFound, userFound, userAlreadyLiked);
                        })
                        .catch((err) => {
                            res.status(500).json({ ' error': ' Cannot check is user already liked !' });
                        })
                } else {
                    res.status(404).json({ ' error': ' User not found ! ' });
                }
            },
            function (msgFound, userFound, userAlreadyLiked, callback) {
                if (!userAlreadyLiked) {
                    msgFound.addUser(userFound, { isLike: DISLIKED })
                        .then((alreadyLiked) => {
                            callback(null, msgFound, userFound);
                        })
                        .catch((err) => {
                            res.status(500).json({ 'error': 'Cannot add user\'s comment !' });
                        });
                } else {
                    if (userAlreadyLiked.isLike === LIKED) {
                        userAlreadyLiked.update({
                            isLike: DISLIKED
                        })
                            .then(() => {
                                callback(null, msgFound, userFound);
                            })
                            .catch((err) => {
                                res.status(500).json({ 'error': 'Cannot update comment ! ' });
                            });
                    } else {
                        res.status(409).json({ 'error': 'Post already disliked !' });
                    }
                }
            },
            function (msgFound, userFound, callback) {
                msgFound.update({
                    likes: msgFound.likes - 1
                })
                    .then(() => {
                        callback(msgFound);
                    })
                    .catch((err) => {
                        res.status(500).json({ 'error': 'Impossible to update likes counter ! ' });
                    });
            },
        ], function (msgFound) {
            if (msgFound) {
                return res.status(201).json(msgFound);
            } else {
                res.status(500).json({ 'error': ' Comment no update !' });
            }
        });

    }
}