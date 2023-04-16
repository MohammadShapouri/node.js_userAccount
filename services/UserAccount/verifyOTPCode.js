const {getOTPValidationObjectBaseOnUsage, findUserAccountById, findOneUserAccountByPhoneNumberOrUsername, activateAccountById, validateOTPCode, generateOTPCode, addOTPCodeTOUserAcount, addOTPCodeTOUserAcountBaseOnId, ALL_OTP_USAGE_TYPES} = require('../../models/user.models.js');
const {validateOTPCodeVerificationInput} = require('./validators.js');





async function verifyUserAccountVerificationOTP(req, res) {
	try {
		const requestedUserAccount = await findUserAccountById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this ID.');

	
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[0]);
		if(verificationResult.result === false) {
			return res.status(400).json(verificationResult.msg);
		} else {
			await activateAccountById(requestedUserAccount);
			return res.status(200).json(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(500).json("Something went wrong during checking OTP code.");
	}
}





async function verifyPasswordResetOTP(req, res) {
	try {
		if(req.session.requestedUserAccountData === undefined || req.session.requestedUserAccountData === null) {
			return res.status(403).json('You don\'t have access to password reset otp verifier page.');
		} else {
			const validationResult = validateOTPCodeVerificationInput(req.body);
			if(validationResult !== null) return res.status(400).send(validationResult);

			const requestedUserAccount = await findOneUserAccountByPhoneNumberOrUsername(req.session.requestedUserAccountData)
			if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this phone number.');


			const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
			if(verificationResult.result === false) {
				return res.status(400).json(verificationResult.msg);
			} else {
				req.session.hasPasswordResetAccess = true;
				return res.status(200).json(verificationResult.msg);
			}		
		}
	} catch(error) {
		console.log(error);
		return res.status(500).json("Something went wrong during checking OTP code.");
	}
}





async function verifyNewPhoneNumberVerificationOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[2]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			// LOGIC GOES HERE...
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(500).json("Something went wrong during checking OTP code.");
	}
}





async function verifyLoginSecondStepOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[3]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			// LOGIC GOES HERE...
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(500).json("Something went wrong during checking OTP code.");
	}
}









module.exports.verifyUserAccountVerificationOTP = verifyUserAccountVerificationOTP;
module.exports.verifyPasswordResetOTP = verifyPasswordResetOTP;
module.exports.verifyNewPhoneNumberVerificationOTP = verifyNewPhoneNumberVerificationOTP;
module.exports.verifyLoginSecondStepOTP = verifyLoginSecondStepOTP;
