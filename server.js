const express = require('express');
const bodyParser = require('body-parser');
const stuff = require('./stuff').router;


const server = express();

server.use(bodyParser.urlencoded({ extended: true}));
server.use(bodyParser.json());



server.get('/', function(req, res) {
      res.setHeader('content-Type', 'text/html');
      res.status(200).send('<h1>Bienvenus sur mon serveur !</h1>');
});

server.use('/api/', stuff);

server.listen(8080, function(){
    console.log('*********** My Server running! ************');
});