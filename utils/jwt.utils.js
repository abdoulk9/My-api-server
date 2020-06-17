const jwt = require('jsonwebtoken');

const  JWT_SECRET_SIGN = '$2y$12$EIc2VhXrF7OZF52HeEIZUOlApO1pRV.8avEvQPa0x4YY9Gv5DvXVW';


module.exports = {
    generateToken: (userData) =>{
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
         JWT_SECRET_SIGN,
         {
             expiresIn: '1H'
         }
         )
    },

    parseAuth: (auth) =>{
        return (auth != null) ? auth.replace('Bearer ', '') : null;
    },
    
    getId: (auth) =>{
        //console.log(auth);
        let userId = -1 ;
        let token = module.exports.parseAuth(auth); 
        if(token != null){
            try{
                var jwtToken = jwt.verify(token, JWT_SECRET_SIGN);
                console.log(jwtToken);
                if(jwtToken != null){
                    console.log('dans le jwtToken');
                    userId = jwtToken.userId;
                }
            }catch(err){}
        }
        return userId;
    }
}