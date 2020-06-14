const jwt = require('jsonwebtoken');

const  JWT_SECRET_SIGN = 'm276Me7teXY78dUts8W9xFL6Ju';


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
    
    

    getUserId: (auth) =>{
        //console.log(auth);
        let userId = -1 ;
        let token = module.exports.parseAuth(auth); console.log('le token');console.log(token);
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