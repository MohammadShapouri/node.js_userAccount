const {validateOTPCode, findUserAccountById, ALL_OTP_USAGE_TYPES} = require('../../models/user.models.js');
const {validateOTPCodeVerificationInput} = require('./validators.js');





async function verifyUserAccountVerificationOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[0]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(400).send("Something went wrong during checking OTP code.");
	}
}




async function verifyPasswordResetOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[1]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(400).send("Something went wrong during checking OTP code.");
	}
}





async function verifyNewPhoneNumberVerificationOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[2]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(400).send("Something went wrong during checking OTP code.");
	}
}





async function verifyLoginSecondStepOTP(req, res) {
	try {
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)

		const requestedUserAccount = await findUserAccountById(req.params.id)
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');


		const verificationResult = await validateOTPCode(req.body.OTP_code, requestedUserAccount, ALL_OTP_USAGE_TYPES[3]);
		if(verificationResult.result === false) {
			return res.status(400).send(verificationResult.msg);
		} else {
			return res.status(200).send(verificationResult.msg);
		}

	} catch(error) {
		console.log(error);
		return res.status(400).send("Something went wrong during checking OTP code.");
	}
}









module.exports.verifyUserAccountVerificationOTP = verifyUserAccountVerificationOTP;
module.exports.verifyPasswordResetOTP = verifyPasswordResetOTP;
module.exports.verifyNewPhoneNumberVerificationOTP = verifyNewPhoneNumberVerificationOTP;
module.exports.verifyLoginSecondStepOTP = verifyLoginSecondStepOTP;
