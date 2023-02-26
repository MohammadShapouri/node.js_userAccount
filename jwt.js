const jwt = require('jsonwebtoken');

var username = 'Username'

const jwttoken = jwt.sign({username}, 'JWTKey', {algorithm: "HS256", expiresIn: 5*60*1000});
console.log(jwttoken);

payload = jwt.verify(jwttoken, 'JWTKey');
console.log(payload);


const date = new Date(payload.iat);
console.log(date);


const duration = payload.exp-payload.iat;
console.log(duration);