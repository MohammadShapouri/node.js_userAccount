require('dotenv').config();

var config = {
	server: {
		"host": undefined,
		"port": undefined
	},
	JWT: {
		"JWTKey": undefined,
		"AccessTokenExpirySeconds": undefined,
		"RefreshTokenExpirySeconds": undefined
	},
	session: {
		"sessionKey": undefined
	},
	database: {

	}
}





if(process.env.NODE_ENV === 'development') {
	config.server.host = 'localhost';
	config.server.port = 4000;
	config.JWT.JWTKey = process.env.JWTKey;
	config.JWT.AccessTokenExpirySeconds = 3600000; // 1 Hour
	config.JWT.RefreshTokenExpirySeconds = 15552000000; // 180 Days
	config.session.sessionKey = process.env.sessionKey;

} else if(process.env.NODE_ENV === 'production') {
	config.server.host = 'localhost';
	config.server.port = 4000;
	config.JWT.JWTKey = process.env.JWTKey;
	config.JWT.AccessTokenExpirySeconds = 1800000; // 30 Minutes
	config.JWT.RefreshTokenExpirySeconds = 15552000000; // 180 Days
	config.session.sessionKey = process.env.sessionKey;

} else {
	throw new Error('Invalid state was set in NODE_ENV');
}





module.exports = config;
