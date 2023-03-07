const express = require('express');
const router = express.Router();

const {getAllUserAccount} = require('./UserAccount/getAllUserAccounts.js');
const {getSpecificUserAccount} = require('./UserAccount/getSpecificUserAccount.js');
const {addUserAccount} = require('./UserAccount/addUserAccount.js');
const {updateUserAccount} = require('./UserAccount/updateUserAccount.js');
const {deleteUserAccount} = require('./UserAccount/deleteUserAccount.js');
const {changeUserAccountPassword} = require('./UserAccount/changeUserAccountPassword.js');







router.get('/', (req, res) => getAllUserAccount(req, res));
router.get('/:id', (req, res) => getSpecificUserAccount(req, res));
router.post('/', (req, res) => addUserAccount(req, res));
router.patch('/:id', (req, res) => updateUserAccount(req, res));
router.delete('/:id', (req, res) => deleteUserAccount(req, res));
router.patch('/changepassword/:id', (req, res) => changeUserAccountPassword(req, res));





module.exports = router;