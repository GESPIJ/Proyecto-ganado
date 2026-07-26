const express = require('express');
const AnimalController = require('@controllers/animalController');
const upload = require('@middleware/upload');

const router = express.Router();

router.get('/', AnimalController.getAll);
router.get('/:id', AnimalController.getOne);
router.put('/:id', AnimalController.upsert);
router.delete('/:id', AnimalController.remove);

router.post('/:id/registros', AnimalController.addRegistro);
router.delete('/:id/registros/:registroId', AnimalController.deleteRegistro);

router.post('/:id/foto', upload.single('foto'), AnimalController.uploadFoto);

module.exports = router;
