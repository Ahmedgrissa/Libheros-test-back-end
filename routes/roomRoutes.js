var express = require('express');
var router = express.Router();
var roomController = require('../controllers/roomController.js');

/*
 * GET
 */
router.get('/', roomController.list);

/*
 * GET
 */
router.get('/:id', roomController.show);

/*
 * POST
 */
router.post('/', roomController.create);

/*
 * PUT
 */
router.put('/:id', roomController.update);

/*
 * DELETE
 */
router.delete('/:id', roomController.remove);

module.exports = router;