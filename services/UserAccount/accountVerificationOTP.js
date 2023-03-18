const {getOTPValidationObjectBaseOnUsage, findUserAccountById, validateOTPCode, addOTPCodeTOUserAcountBaseOnId, ALL_OTP_USAGE_TYPES} = require('../../models/user.models.js');
const {validateOTPCodeVerificationInput} = require('./validators.js');





async function AccountVerificationOTP(req, res) {
	const requestedUserAccount = await findUserAccountById(req.params.id);
	// Sequence is so important in this if condition.
	if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

	const accountVerificationOTPSearchingResult = getOTPValidationObjectBaseOnUsage(requestedUserAccount, ALL_OTP_USAGE_TYPES[0]);
	if(accountVerificationOTPSearchingResult === null) {
		
	}
}






async function verifyUserAccountVerificationOTP(req, res) {
	try {
		const requestedUserAccount = await findUserAccountById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

	
		const validationResult = validateOTPCodeVerificationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult)


		const verificationResult = await validateOTPCode(req.body.OTP_code, req.params.id, ALL_OTP_USAGE_TYPES[0]);
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


