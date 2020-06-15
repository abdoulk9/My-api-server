const models = require('../models');
const asyncPack = require('async');
const jwtUtils = require('../utils/jwt.utils');

const LIMIT_TITLE = 2,
    LIMIT_CONTENT = 4,
    ITEMS_LIMIT = 40;


module.exports = {
    createMessage: (req, res) => {
        console.log('Operation done!!');

        let headerAuth = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth);

        let title = req.body.title;
        let content = req.body.content;

        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'Paramater(s) missing(s)' });
        }

        if (title.length <= LIMIT_TITLE || content.length <= LIMIT_CONTENT) {
            return res.status(400).json({ 'error': 'Paramater(s) invalid(s)' });
        }
       
        asyncPack.waterfall([
            function (callback) {
                models.User.findOne({
                    where: { id: userId }
                })
                    .then((userFound) => {
                        callback(null, userFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({ 'error': 'Unable to verify this user !' });
                    })
            },
            function (userFound, callback) {
                if (userFound) {
                    models.Message.create({
                        title: title,
                        content: content,
                        likes: 0,
                        UserId: userFound.id
                    })
                        .then((newMessage) => {
                            callback(newMessage);
                        });
                } else {
                    return res.status(404).json({ 'error': ' User not found !' });
                }
            }
        ], function (newMessage) {
            if (newMessage) {
                return res.status(201).json(newMessage);
            } else {
                return res.status(500).json({ 'error': 'Cannot create message !' });
            }
        });
    },

    getMessages: (req, res) => {

        let fields = req.query.fields;
        let limit = parseInt(req.query.limit); console.log(limit);
        let offset = parseInt(req.query.offset);console.log(offset);
        let  order = req.query.order; 
        console.log(order);

        if(limit > ITEMS_LIMIT){
            limit =ITEMS_LIMIT;
        }

        models.Message.findAll({
            order: [( order != null) ? order.split(':') : ['title', 'ASC']],
            attributes:(fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset :null,
            include: [{
                model: models.User,
                attributes: ['username']
            }]
        }).then((messages) =>{
            if(messages){
                res.status(200).json(messages);
            }else{
                res.status(404).json({ 'error':' Not found massages! '});
            }
        })
        .catch((err) =>{
            res.status(500).json({ 'error': ' Fields invalid'});
        });

    }
}