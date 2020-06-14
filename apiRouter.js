const express = require('express');
const usersCtrl = require('./routes/userCtrl');


exports.router = (function(){
    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/profil/').get(usersCtrl.getUserProfil);

    return apiRouter;
})();