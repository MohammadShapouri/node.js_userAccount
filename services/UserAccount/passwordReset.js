const {getOTPValidationObjectBaseOnUsage, findUserAccountById, findOneUserAccountByPhoneNumberOrUsername, resetPasswordById, addOTPCodeToUserAccount, deleteOTPValidationObject, ALL_OTP_USAGE_TYPES} = require('../../models/user.models.js');
const {validatePasswordResetInput} = require('./validators.js')






async function generatePasswordResetOTP(req, res) {
	try {
		const validationResult = await validateUserJWTTokenGenerationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);

		const requestedUserAccount = await findOneUserAccountByPhoneNumberOrUsername(req.body.phone_number_username);
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this phone number.');


		const passwordResetOTPSearchingResult = getOTPValidationObjectBaseOnUsage(requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
		if(passwordResetOTPSearchingResult === null) {
			await addOTPCodeToUserAccount(requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
		} else {
			await deleteOTPValidationObject(requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
			await addOTPCodeToUserAccount(requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
		}
		req.session.requestedUserAccountData = req.body.phone_number_username;
		res.status(200).json("Password reset code sent.");
		
	} catch(error) {
		console.log(error);
		return res.status(500).json("Something went wrong during creating password reset OTP code.");
	}
}






async function resetPassword(req, res) {
	try {
		if(req.session.hasPasswordResetAccess === undefined || req.session.hasPasswordResetAccess === null || req.session.hasPasswordResetAccess === false) {
			return res.status(403).json('You don\'t have access to password reset page.');

		} else if(req.session.hasPasswordResetAccess === true) {
			const requestedUserAccount = await findOneUserAccountByPhoneNumberOrUsername(req.session.requestedUserAccountData);
			if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this phone number.');

			const validationResult = validatePasswordResetInput(req.body);
			if(validationResult !== null) return res.status(400).send(validationResult);
			
			delete req.session.hasPasswordResetAccess;
			delete req.session.requestedUserAccountData;
			await resetPasswordById(req.params.id, req.body);

			return res.status(200).json('Password reseted.');	
		}

	} catch(error) {
		console.log(error);
		if(req.session.hasPasswordResetAccess !== undefined || req.session.hasPasswordResetAccess !== null || req.session.hasPasswordResetAccess !== false) {
			delete req.session.hasPasswordResetAccess;
		}
		return res.status(500).json("Something went wrong during changing password reset OTP code.");	}
}








module.exports.generatePasswordResetOTP = generatePasswordResetOTP;
module.exports.resetPassword = resetPassword;
