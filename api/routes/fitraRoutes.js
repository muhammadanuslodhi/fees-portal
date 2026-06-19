const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/fitraController');
router.use(auth);
router.get('/', c.list);
router.post('/', c.upsert);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
module.exports = router;
