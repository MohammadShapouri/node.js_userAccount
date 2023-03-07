const bcrypt = require('bcryptjs');
const {UserAccount} = require('../../models/user.models.js');



// Returns hashed password. If an error occurs, it returns null.
async function hashPassword(plainTextPassword) {
	const saltRound = 10;
	try {
		const salt = await bcrypt.genSalt(saltRound);
		return {status: 'success', password: await bcrypt.hash(plainTextPassword, salt), error: null};
		// return await bcrypt.hash(plainTextPassword, saltRound);
	} catch(error) {
		console.log(error);
		return {status: 'failure', password: null, error: error};
		// return {unexpected_error: true, error:error};
	}
}


// Returns true if input password is the same as user's password otherwise, returns false.
// Returns a js object containing {invalidUser: true, description: 'No user found.'} when it wnats to find user by its
//	id and no user exists with that id, or null when an error occurs in any situation.
async function comparePassword(plainTextPassword, userAccountDoc=null, userAccountID=null) {
	var userAccount = null;

	try {
		if(userAccountDoc) {
			userAccount = userAccountDoc;
		} else if(userAccountID) {
			userAccount = await UserAccount.findById(userAccountID);
			if(userAccount === null || userAccount.length === 0) return {status: 'invalidUser', compareResult: null, error: null};
		}
		return {status: 'success', compareResult: await bcrypt.compare(plainTextPassword , userAccountDoc.password), error: null};
	} catch(error) {
		return {status: 'failure', compareResult: null, error: error};
		// return {unexpected_error: true, error:error};
	}
}





module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;