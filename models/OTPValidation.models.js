const mongoose = require('mongoose');
const {findUserAccountByPhoneNumber} = require('./user.models.js');
mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));




const RETRY_COUNTER_LIMIT = 5;
const ALL_OTP_USAGE_TYPES = ['userAccount_verification', 'password_reset', 'new_phone_number_verification', 'login_second_step'];
const OTP_EXPIRATION_TIME = {
	userAccount_verification: +new Date() + 60*60*1000,
	password_reset: +new Date() + 5*60*1000,
	new_phone_number_verification: +new Date() + 60*60*1000,
	login_second_step: +new Date() + 5*60*1000
}






const OTPValidationSchema = mongoose.Schema({
	OTP_code: {
		type: Number,
		minlength: 8,
		maxlength: 8,
		require: [true, 'OTP Code is required.']
	},
	retry_counter: {
		type: Number,
		maxlength: 5,
		default: 0
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	expires_at: {
		type: Date,
		default: +new Date() + 5*60*1000
		// default: new Date(+new Date() + 5*60*1000)
		// default: function() {return +new Date() + 5*60*1000}
	},
	usage_type: {
		type: String,
		require: [true, 'Decelaring usage type is required.'],
		enum: ALL_OTP_USAGE_TYPES,
		validate: {
			isasync: false,
			validator: function(value) {
				return ALL_OTP_USAGE_TYPES.includes(value);
			},
			message: '{VALUE} is not among acceptable values of the list.'
			
		}
	}
	// is_used: {
	// 	type: Boolean,
	// 	default: false
	// }
});


const OTPValidation = mongoose.model("OTP Validation", OTPValidationSchema);










async function generateOTPCode(OTPUsageType) {
	if(ALL_OTP_USAGE_TYPES.includes(OTPUsageType) === false) {
		throw new Error(`OTP usage type must be one of these values: ${ALL_OTP_USAGE_TYPES}`);
	}

	const OTPValidationCodeData = {
		OTP_code: parseInt(10000000 + Math.random()* 90000000),
		expires_at: OTP_EXPIRATION_TIME[OTPUsageType],
		usage_type: OTPUsageType
	}

	return await OTPValidation.create(OTPValidationCodeData)
}






async function validateOTPCode(OTP_code, phone_number) {
	const requestedUserAccount = await findUserAccountByPhoneNumber(phone_number);
	if(requestedUserAccount === null || requestedUserAccount.length === 0) return {result: false, desc: 'No user exists with this phone number.'}



}

module.exports.generateOTPCode = generateOTPCode;
module.exports.RETRY_COUNTER_LIMIT = RETRY_COUNTER_LIMIT;
module.exports.ALL_OTP_USAGE_TYPES = ALL_OTP_USAGE_TYPES;
