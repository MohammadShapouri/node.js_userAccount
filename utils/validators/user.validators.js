const UserAccount = require('../../models/user.models.js');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);









const usernameExists = 'Username already exists.'
const phone_numberExists = 'Phone number already exists.'


async function validateUserCreation(body) {

	const UserCreationSchema = Joi.object({
		first_name: Joi.string()
			.label('First name')
			.required()
			.empty()
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
			.min(3)
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
			.min(2)
			.max(29)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		phone_number: Joi.number()
			.label("Phone number")
			.strict()
			.required()
			.empty()
			.messages({
				// "any.strict": "{#labe} must be number."
				"number.base": "{#label} must be number.",
				"any.required": "{#label} is required.",
				"number.empty": "{#label} must not be empty.",
				"number.min": "{#label} must have atleast {#limit} characters.",
				"number.max": "{#label} must have atleast {#limit} characters."
			}),

		password: Joi.string()
			.label('Password')
			.required()
			.empty()
			.min(8)
			.max(50)
			.messages({
				"string.base": "{#label} must be string.",
				"any.required": "{#label} is required.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			})
	});

	const joiValidationResult = UserCreationSchema.validate(body, { abortEarly: false });

	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}

	// Check uniqueness of username and phone number.
	try {
		const users = await UserAccount.find({ $or: [{ username: body.username }, { phone_number: body.phone_number }] });

		if(users) {
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

	} catch(error) {
		console.log(error);
		return {unexpected_error: true}
	}

		console.log(Object.keys(errorMessages).length);
	// if(errorMessages === {}) return null;
	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages;
}










function validateUserNewInfo(body) {

	const UserCreationSchema = Joi.object({
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
			.min(3)
			.max(20)
			.messages({
				"string.base": "{#label} must be string.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		username: Joi.string()
			.label('Username')
			.min(2)
			.max(29)
			.messages({
				"string.base": "{#label} must be string.",
				"string.empty": "{#label} must not be empty.",
				"string.min": "{#label} must have atleast {#limit} characters.",
				"string.max": "{#label} must have atleast {#limit} characters."
			}),

		phone_number: Joi.number()
			.label("Phone number")
			.strict()
			.messages({
				// "any.strict": "{#labe} must be number."
				"number.base": "{#label} must be number.",
				"number.empty": "{#label} must not be empty.",
				"number.min": "{#label} must have atleast {#limit} characters.",
				"number.max": "{#label} must have atleast {#limit} characters."
			}),
	});

	const joiValidationResult = UserCreationSchema.validate(body, { 'abortEarly': false });


	var errorMessages = {};
 	if(joiValidationResult.error) {
		for(errorItem of joiValidationResult.error["details"]) {
			var key = errorItem["context"]["key"];
			errorMessages[key] = errorItem["message"];
		}
	}
	if(Object.keys(errorMessages).length === 0) return null;
	return errorMessages
}










// function validateInputObjectId(body) {
// 	const objectIdSchema = Joi.object({
// 		id: Joi.objectId()
// 			.label('ID')
// 			.required()
// 			.empty()
// 			.message({
// 				"objectId.base": "{#label} must be a valid object id.",
// 				"any.required": "{#label} is required.",
// 				"objectId.empty": "{#label} must not be empty."
// 			})
// 	});
// 	return objectIdSchema.validate(body, { 'abortEarly': false });
// }





module.exports.validateUserCreation = validateUserCreation;
module.exports.validateUserNewInfo = validateUserNewInfo;
module.exports.usernameExists = usernameExists;
module.exports.phone_numberExists = phone_numberExists;
// module.exports.validateInputObjectId = validateInputObjectId;




//     [
//         {
//             "message": "\"Movie Name\" is required.",
//             "path": [
//                 "name"
//             ],
//             "type": "any.required",
//             "context": {
//                 "label": "Movie Name",
//                 "key": "name"
//             }
//         },
//         {
//             "message": "\"Year\" is required.",
//             "path": [
//                 "year"
//             ],
//             "type": "any.required",
//             "context": {
//                 "label": "Year",
//                 "key": "year"
//             }
//         },
//         {
//             "message": "\"Duration\" is required.",
//             "path": [
//                 "duration"
//             ],
//             "type": "any.required",
//             "context": {
//                 "label": "Duration",
//                 "key": "duration"
//             }
//         },
//         {
//             "message": "\"Author\" is required.",
//             "path": [
//                 "author"
//             ],
//             "type": "any.required",
//             "context": {
//                 "label": "Author",
//                 "key": "author"
//             }
//         }
//     ]
