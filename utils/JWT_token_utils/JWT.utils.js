const jwt = require('jsonwebtoken');



function generateJWTToken(username, phone_number, JWTKey, JWTAccessTokenExpirySeconds, JWTRefreshTokenExpirySeconds) {
	try {
		if(username === null) return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'username is required. Don\'t leave it empty.'};
		if(phone_number === null) return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'phone_number is required. Don\'t leave it empty.'};
		if(JWTKey === null) return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'JWTKey is required. Don\'t leave it empty.'};

		if(JWTAccessTokenExpirySeconds === null) {
			JWTAccessTokenExpirySeconds === 5*60*1000;
		} else if(typeof(JWTAccessTokenExpirySeconds !== null && JWTAccessTokenExpirySeconds) !== 'Integer') {
			return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'JWTAccessTokenExpirySeconds must be \'Integer\'.'};
		}

		if(JWTRefreshTokenExpirySeconds === null) {
			JWTRefreshTokenExpirySeconds === 180*24*60*60*1000;
		} else if(typeof(JWTRefreshTokenExpirySeconds !== null && JWTRefreshTokenExpirySeconds) !== 'Integer') {
			return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'JWTRefreshTokenExpirySeconds must be \'Integer\'.'};
		}

		const JWTAccessToken = jwt.sign({username, phone_number}, JWTKey, {algorithm: "HS256", expiresIn: JWTAccessTokenExpirySeconds});
		const JWTRefreshToken = jwt.sign({username, phone_number, JWTAccessTokenExpirySeconds}, JWTKey, {algorithm: "HS256", expiresIn: JWTRefreshTokenExpirySeconds});
		return {status: 'success', JWTAccessToken: JWTAccessToken, JWTRefreshToken: JWTRefreshToken, error: null};

	} catch(error) {
		return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: error};
	}
	
}





function validateJWTToken(JWTAccessToken, JWTKey) {
	try {
		if(JWTToken === null) return {status: 'failure', payload: null, error: 'JWTToken is required. Don\'t leave it empty.'};
		if(JWTKey === null) return {status: 'failure', payload: null, error: 'JWTKey is required. Don\'t leave it empty.'};

		// It can be a reason of error if jwt token is invalid.
		const payload = jwt.verify(JWTAccessToken, JWTKey);
		return {status: 'success', payload: payload, error: null};
	} catch(error) {
		// This 'if statement' seperates unautherized user error (invalid jwt token caused it) from server errors.
		if (error instanceof jwt.JsonWebTokenError) {
			return {status: 'failure', payload: null, error: 'Unauthorized. JWT token is invalid. No user found with this JWT token.', recommended_status_code:401};
		}
		return {status: 'failure', payload: null, error: 'Something went wrong during checking JWT token.', recommended_status_code:400};
	}

}






function renewJWTToken(JWTRefreshToken, JWTKey) {
	try {
		if(JWTToken === null) return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'JWTToken is required. Don\'t leave it empty.'};
		if(JWTKey === null) return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'JWTKey is required. Don\'t leave it empty.'};

		// It can be a reason of error if jwt token is invalid.
		const payload = jwt.verify(JWTRefreshToken, JWTKey);

		// // We ensure that a new token is not issued until enough time has elapsed
		// // In this case, a new token will only be issued if the old token is within
		// // 30 seconds of expiry. Otherwise, return a bad request status
		// const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
		// if (payload.exp - nowUnixSeconds > 30) {
		// 	// return res.status(400).end()
		// 	return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'can only renew JWT token within 30 seconds of its expiry.'};
		// }

		const JWTAccessToken = jwt.sign({payload.username, payload.phone_number}, JWTKey, {algorithm: "HS256", expiresIn: payload.JWTAccessTokenExpirySeconds});
		return {status: 'success', JWTAccessToken: JWTAccessToken, error: null};

	} catch(error) {
		// This 'if statement' seperates unautherized user error (invalid jwt token caused it) from server errors.
		if (error instanceof jwt.JsonWebTokenError) {
			return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'Unauthorized. JWT token is invalid. No user found with this JWT token.', recommended_status_code:401};
		}
		return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'Something went wrong during renewing JWT token.', recommended_status_code:400};
	}

}