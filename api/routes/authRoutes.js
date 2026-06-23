const router = require('express').Router();
const { login, tempReset } = require('../controllers/authController');
router.post('/login', login);
router.get('/temp-reset', tempReset);
module.exports = router;
