const express = require('express');
const usersCtrl = require('./routes/userCtrl');
const messageCtrl = require('./routes/messageCtrl');
const likesCtrl = require('./routes/likesCtrl');


exports.router = (function(){
    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/profil/').get(usersCtrl.getProfil);
    apiRouter.route('/users/update/').put(usersCtrl.updateProfil);

    apiRouter.route('/messages/new/').post(messageCtrl.createMessage);
    apiRouter.route('/messages/').get(messageCtrl.getMessages);

    apiRouter.route('/post/:messageId/like/').post(likesCtrl.likePost);
    apiRouter.route('/post/:messageId/dislike/').post(likesCtrl.dislikePost);

    return apiRouter;
})();