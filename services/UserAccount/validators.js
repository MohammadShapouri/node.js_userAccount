const {usernameRegex, phone_numberRegex, findUserAccountsForValidation, findUserAccountById} = require('../../models/user.models.js');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


// ALL PASSWORD2 CUSTOM VALIDATIONS MUST BE REDESIGNED.




const usernameExists = 'Username already exists.'
const phone_numberExists = 'Phone number already exists.'
const password2Different = 'Two passwords are different from each other.'

async function validateUserCreationData(body) {
	const UserCreationSchema = Joi.object({
		first_name: Joi.string()
			.label('First name')
			.required()
			.empty()
			.trim()
			.min(3)
			.max(20)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		last_name: Joi.string()
			.label('Last name')
			.optional()
			.allow(null, '')
			.trim()
			.max(20)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		username: Joi.string()
			.label('Username')
			.required()
			.empty()
			.trim()
			.regex(usernameRegex)
			.min(5)
			.max(29)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		phone_number: Joi.string()
			.label("Phone number")
			// .strict()
			.required()
			.empty()
			.trim()
			.regex(phone_numberRegex)
			.messages({
				// "any.strict": "{#labe} must be number."
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.pattern.base": "{#label} does not have valid pattern.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		password1: Joi.string()
			.label('Password')
			.required()
			.empty()
			.trim()
			.min(8)
			.max(100)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		password2: Joi.string()
			.label('Re-entered Password')
			.required()
			.empty()
			.trim()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty."
			})
	});

	const joiValidationResult = UserCreationSchema.validate(body, {abortEarly: false, stripUnknown: true});

	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}

	// converts '' to null for last_name
	if(body.last_name === '') body.last_name = null;

	// Checks similarity between two passwords.
	if((body.password2 !== null && body.password2 !== '') && (body.password1 !== null && body.password1 !== '')) {
		if(body.password1 !== body.password2) {
			if(errorMessages.hasOwnProperty("password2")) {
				const password2PreviousError = errorMessages["password2"];
				errorMessages["password2"] = [password2Different, password2PreviousError];
			} else {
				errorMessages["password2"] = password2Different;
			}	
		}		
	}


	// Checks uniqueness of username and phone number.
	const users = await findUserAccountsForValidation(body.username, body.phone_number);

	if(users !== null || users.length !== 0) {
		for(eachUser of users) {
			if(eachUser.username === body.username) {
				if(errorMessages.hasOwnProperty("username")) {
					const usernamePreviousError = errorMessages["username"];
					errorMessages["username"] = [usernameExists, usernamePreviousError];
				} else {
					errorMessages["username"] = usernameExists;
				}
			}
			if(eachUser.phone_number === body.phone_number) {
				if(errorMessages.hasOwnProperty("phone_number")) {
					const phone_numberPreviousError = errorMessages["phone_number"];
					errorMessages["phone_number"] = [phone_numberExists, phone_numberPreviousError];
				} else {
					errorMessages["phone_number"] = phone_numberExists;
				}
			}
		}
	}


	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}










async function validateUserNewInfo(body, _id) {
	const NewUserInfoSchema = Joi.object({
		first_name: Joi.string()
			.label('First name')
			.min(3)
			.max(20)
			.messages({
				"string.base": "{#label} must be string.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		last_name: Joi.string()
			.label('Last name')
			.optional()
			.allow(null, '')
			.max(20)
			.messages({
				"string.base": "{#label} must be string.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		username: Joi.string()
			.label('Username')
			.regex(usernameRegex)
			.min(5)
			.max(29)
			.messages({
				"string.base": "{#label} must be string.",
				"string.empty": "{#label} must not be empty.",
				"string.pattern.base": "{#label} does not have valid pattern.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		phone_number: Joi.string()
			.label("Phone number")
			.empty()
			.trim()
			.regex(phone_numberRegex)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.pattern.base": "{#label} does not have valid pattern.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			})
	});

	const joiValidationResult = NewUserInfoSchema.validate(body, {'abortEarly': false, stripUnknown: true});


	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}

	// converts '' to null for last_name
	if(body.last_name === '') body.last_name = null;

	const douplicateUsers = await findUserAccountsForValidation(body.username, body.phone_number);

	if(douplicateUsers) {
		for(eachUser of douplicateUsers) {
			if(eachUser.username === body.username && String(eachUser._id) !== _id) {
				if(errorMessages.hasOwnProperty("username")) {
					const usernamePreviousError = errorMessages["username"];
					errorMessages["username"] = [usernameExists, usernamePreviousError];
				} else {
					errorMessages["username"] = usernameExists;
				}
			}
			if(eachUser.phone_number === body.phone_number && String(eachUser._id) !== _id) {
				if(errorMessages.hasOwnProperty("phone_number")) {
					const phone_numberPreviousError = errorMessages["phone_number"];
					errorMessages["phone_number"] = [phone_numberExists, phone_numberPreviousError];
				} else {
					errorMessages["phone_number"] = phone_numberExists;
				}
			}
		}
	}


	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}








function ValidateDeleteAccountPasswords(body) {

	const PasswordVerificationSchema = Joi.object({
		password: Joi.string()
		.label('Password')
		.required()
		.empty()
		.trim()
		.messages({
			"string.base": "{#label} must be string.",
			"any.required": "{#label} is required.",
			"string.empty": "{#label} must not be empty.",
			"string.min": "{#label} must have atleast {#limit} characters.",
			"string.max": "{#label} must have atleast {#limit} characters."
		})
	});

	const validationResult = PasswordVerificationSchema.validate(body, {'abortEarly': false, stripUnknown: true});

	var errorMessages = {};
 	if(validationResult.error) {
		for(errorItem of validationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}
	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}








function validatePasswordChangingInputs(body) {
	const validatePasswordChangingInputsSchema = Joi.object({
		old_password: Joi.string()
			.label('Old Password')
			.required()
			.empty()
			.trim()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
				}),
		new_password1: Joi.string()
			.label('New Password')
			.required()
			.empty()
			.trim()
			.min(8)
			.max(100)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
				}),
		new_password2: Joi.string()
			.label('Re-entered New Password')
			.required()
			.empty()
			.trim()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				})
	});
	const joiValidationResult = validatePasswordChangingInputsSchema.validate(body, {abortEarly: false, stripUnknown: true});

	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}


	// Checks similarity between two passwords.
	if((body.new_password2 !== null && body.new_password2 !== '') && (body.new_password1 !== null && body.new_password1 !== '')) {
		if(body.new_password1 !== body.new_password2) {
			if(errorMessages.hasOwnProperty("new_password2")) {
				const password2PreviousError = errorMessages["new_password2"];
				errorMessages["new_password2"] = [password2Different, password2PreviousError];
			} else {
				errorMessages["new_password2"] = password2Different;
			}	
		}		
	}
	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}









function validatePasswordResetInput(body) {
	const validatePasswordResetInputSchema = Joi.object({
		new_password1: Joi.string()
			.label('New Password')
			.required()
			.empty()
			.trim()
			.min(8)
			.max(100)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
				}),
		new_password2: Joi.string()
			.label('New Password')
			.required()
			.empty()
			.trim()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty."
				})

	});
	const joiValidationResult = validatePasswordResetInputSchema.validate(body, {abortEarly: false, stripUnknown: true});

	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}errorMessages
	}


	// Checks similarity between two passwords.
	if((body.new_password2 !== null && body.new_password2 !== '') && (body.new_password1 !== null && body.new_password1 !== '')) {
		if(body.new_password1 !== body.new_password2) {
			if(errorMessages.hasOwnProperty("new_password2")) {
				const password2PreviousError = errorMessages["new_password2"];
				errorMessages["new_password2"] = [password2Different, password2PreviousError];
			} else {
				errorMessages["new_password2"] = password2Different;
			}	
		}		
	}
	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;

}
















function validateOTPCodeVerificationInput(OTPCode) {
	const OTPCodeValidationSchema = Joi.object({
		OTP_code: Joi.string()
			.label('OTP Code')
			.required()
			.empty()
			.trim()
			.min(8)
			.max(8)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			})
	});
	const JoiValidationResult = OTPCodeValidationSchema.validate(OTPCode, {abortEarly: false, stripUnknown: true});

	var errorMessages = {};
 	if(JoiValidationResult.error) {
		for(errorItem of JoiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}

	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}









function validateJWTTokenGenerationInput(body) {
	// Finding general problems.
	const UserJWTTokenGenerationInputSchema = Joi.object({
		phone_number_username: Joi.string()
			.label('Phone number or Username')
			.required()
			.empty()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty."
			}),
		password: Joi.string()
			.label('Password')
			.required()
			.empty()
			.trim()
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
				}),
	});
	const JoiValidationResult = UserJWTTokenGenerationInputSchema.validate(body, {abortEarly: false, stripUnknown: true});


	var errorMessages = {};
 	if(JoiValidationResult.error) {
		for(errorItem of JoiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}

	// Returns error messages if an error exists.
	if(Object.keys(errorMessages).length !== 0) return errorMessages;


	// Finding specidic problems base on body type.
	if(/^\d+$/.test(body.phone_number_username) === true) {
		// when input contains only numbers (phonenumber).
		if(phone_numberRegex.test(body.phone_number_username) === false) {
			errorMessages['phone_number_username'] = "Phone number does not have valid pattern.";
		}
	} else {
		// when input contains numbers and strings (username).
		if(usernameRegex.test(body.phone_number_username) === false) {
			errorMessages['phone_number_username'] = "Username does not have valid pattern.";
		}
	}



	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}

















module.exports.validateUserCreationData = validateUserCreationData;
module.exports.validateUserNewInfo = validateUserNewInfo;
module.exports.ValidateDeleteAccountPasswords = ValidateDeleteAccountPasswords;
module.exports.validatePasswordChangingInputs = validatePasswordChangingInputs;
module.exports.validatePasswordResetInput = validatePasswordResetInput;
module.exports.validateOTPCodeVerificationInput = validateOTPCodeVerificationInput;
module.exports.validateJWTTokenGenerationInput = validateJWTTokenGenerationInput;
