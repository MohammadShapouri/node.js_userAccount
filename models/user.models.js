const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));



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
				const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
				return usernameRegex.test(value);
			},
			message: '{VALUE} is not a valid username.'
		}
		// match: [/^[A-Za-z][A-Za-z0-9_]{7,29}$/, '{VALUE} is not a valid username.']
	},
	phone_number: {
		type: Number,
		maxlength: 11,
		require: [true, 'Phone number is required.'],
		unique: [true, 'Phone Number must be unique.'],
		match: [/^09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}$/, '{VALUE} is not a valid phone number.']
	},
	password: {
		type: String,
		maxlength: 1024,
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





module.exports = UserAccount;







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