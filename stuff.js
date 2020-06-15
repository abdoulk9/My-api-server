const express = require('express');
const usersCtrl = require('./routes/userCtrl');
const messageCtrl = require('./routes/messageCtrl');


exports.router = (function(){
    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/profil/').get(usersCtrl.getUserProfil);
    apiRouter.route('/users/update/').put(usersCtrl.updateProfil);

    apiRouter.route('/messages/new/').post(messageCtrl.createMessage);
    apiRouter.route('/messages/').get(messageCtrl.getMessages);

    return apiRouter;
})();