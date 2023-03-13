const express = require('express');
const router = express.Router();

const {getAllUserAccount} = require('./UserAccount/getAllUserAccounts.js');
const {getSpecificUserAccount} = require('./UserAccount/getSpecificUserAccount.js');
const {addUserAccount} = require('./UserAccount/addUserAccount.js');
const {updateUserAccount} = require('./UserAccount/updateUserAccount.js');
const {deleteUserAccount} = require('./UserAccount/deleteUserAccount.js');
const {changeUserAccountPassword} = require('./UserAccount/changeUserAccountPassword.js');







router.get('/', getAllUserAccount);
router.get('/:id', getSpecificUserAccount);
router.post('/', addUserAccount);
router.patch('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);
router.patch('/changepassword/:id', changeUserAccountPassword);





module.exports = router;