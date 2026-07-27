const express = require('express');
const MovimientoController = require('@controllers/movimientoController');

const router = express.Router();

router.get('/', MovimientoController.getAll);
router.put('/:id', MovimientoController.upsert);
router.delete('/:id', MovimientoController.remove);

module.exports = router;
