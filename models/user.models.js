const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));




const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
const phone_numberRegex = /^09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}$/;

const UserAccountSchema = mongoose.Schema({
	first_name: {
		type: String,
		require: [true, 'First name is required.'],
		unique: false,
		minlength: 3,
		maxlength: 20
	},
	last_name: {
		type: String,
		require: false,
		unique: false,
		minlength: 3,
		maxlength: 20
	},
	username: {
		type: String,
		require: [true, 'Username is required.'],
		unique: [true, 'Username must be unique.'],
		validate: {
			isasync: false,
			validator: function(value) {
				return usernameRegex.test(value);
			},
			message: '{VALUE} is not a valid username.'
		}
		// match: [/^[A-Za-z][A-Za-z0-9_]{7,29}$/, '{VALUE} is not a valid username.']
	},
	phone_number: {
		type: String,
		require: [true, 'Phone number is required.'],
		unique: [true, 'Phone Number must be unique.'],
		validate: {
			isasync: false,
			validator: function(value) {
				return phone_numberRegex.test(value);
			},
			message: '{VALUE} is not a valid phone number.'
		}
	},
	password: {
		type: String,
		maxlength: 512,
		require: [true, 'Password is required.']
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
	is_active: {
		type: Boolean,
		default: false
	},
	is_admin: {
		type: Boolean,
		default: false
	},
	is_phone_number_verified:{
		type: Boolean,
		default: false
	}
});
const UserAccount = mongoose.model("User Account", UserAccountSchema)















// const OTPValidationSchema = mongoose.Schema({
// 	OTPCode: {
// 		type: Number,
// 		minlength: 8,
// 		maxlength: 8,
// 		require: [true, 'OTP Code is required.']
// 	},
// 	try_counter: {
// 		type: Number,
// 		maxlength: 5,
// 		default: 0
// 	},
// 	created_at: {
// 		type: Date,
// 		default: Date.now
// 	},
// 	expires_at: {
// 		type: Date,
// 		default: new Date(+new Date() + 1 * 60 * 60 * 1000)
// 		// default: function() {return +new Date() + 1*60*60*1000}
// 	},
// 	is_used: {
// 		type: Boolean,
// 		default: false
// 	}
// });
// const OTPValidationModel = mongoose.model("OTP Validation Model". OTPValidationSchema);














module.exports.UserAccount = UserAccount;
module.exports.usernameRegex = usernameRegex;
module.exports.phone_numberRegex = phone_numberRegex;
// module.exports.OTPValidationModel = OTPValidationModel;





 // validate: {
        //     isAsync: true,
        //     validator: function(value, callback= result => result) {
        //         const notes = this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
        //         // if(error) return callback(error);
        //         return callback(notes === 0);
        //     },
        //     message: "Title is not unique."
        // }
    // },




// noteSchema.path('title').validate(validator= function(value, callback= result => result) {
//     const notes = this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
//     // if(error) return callback(error.message);
//     return callback(notes === 0);
// }, message= "Title is not unique.")


// noteSchema.path('title').validate(validator= async function(value) {
//     const notes = await this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
//     console.log(notes);
//     return notes === 0;
//     // if(notes === 0) return true
//     // return false
// }, message= "Title is not unique.")