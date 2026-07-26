const Joi = require('joi');
const animalService = require('@services/animalService');
const photoService = require('@services/photoService');
const logger = require('@modules/logger');
const { ANIMAL_TIPOS, ANIMAL_ESTADOS, PROPOSITOS, REGISTRO_TIPOS } = require('@constants');

const dateStr = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);

const registroSchema = Joi.object({
  id: Joi.string().optional(),
  fecha: dateStr.required(),
  tipo: Joi.string().valid(...Object.values(REGISTRO_TIPOS)).required(),
  valor: Joi.number().min(0).required(),
  nota: Joi.string().allow('').optional(),
});

const animalSchema = Joi.object({
  id: Joi.string().optional(), // la URL es la autoridad
  identificador: Joi.string().allow('').default('Sin arete'),
  tipo: Joi.string().valid(...Object.values(ANIMAL_TIPOS)).required(),
  estado: Joi.string().valid(...Object.values(ANIMAL_ESTADOS)).required(),
  proposito: Joi.string().valid(...Object.values(PROPOSITOS)).required(),
  fechaEntrada: dateStr.required(),
  fechaSalida: dateStr.allow(null).optional(),
  fechaNacimiento: dateStr.allow(null).optional(),
  pesoEntrada: Joi.number().min(0).default(0),
  pesoActual: Joi.number().min(0).default(0),
  costoCompra: Joi.number().min(0).default(0),
  gastosAcumulados: Joi.number().min(0).default(0),
  valorVenta: Joi.number().allow(null).optional(),
  fotoUrl: Joi.string().uri().allow(null, '').optional(),
  notas: Joi.string().allow('').optional(),
  registros: Joi.array().items(registroSchema).default([]),
});

async function getAll(req, res) {
  try {
    return res.status(200).json(await animalService.listAnimals());
  } catch (error) {
    logger.error('Error listando animales:', error);
    return res.status(500).json({ error: 'No se pudo listar el inventario' });
  }
}

async function getOne(req, res) {
  try {
    const animal = await animalService.getAnimal(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    return res.status(200).json(animal);
  } catch (error) {
    logger.error('Error obteniendo animal:', error);
    return res.status(500).json({ error: 'No se pudo obtener el animal' });
  }
}

async function upsert(req, res) {
  const { error, value } = animalSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const animal = await animalService.upsertAnimal(req.params.id, value);
    return res.status(200).json(animal);
  } catch (err) {
    logger.error('Error guardando animal:', err);
    return res.status(500).json({ error: 'No se pudo guardar el animal' });
  }
}

async function remove(req, res) {
  try {
    await animalService.deleteAnimal(req.params.id);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error borrando animal:', error);
    return res.status(500).json({ error: 'No se pudo borrar el animal' });
  }
}

async function addRegistro(req, res) {
  const { error, value } = registroSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const animal = await animalService.addRegistro(req.params.id, value);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    return res.status(201).json(animal);
  } catch (err) {
    logger.error('Error agregando registro:', err);
    return res.status(500).json({ error: 'No se pudo agregar el registro' });
  }
}

async function deleteRegistro(req, res) {
  try {
    const animal = await animalService.removeRegistro(req.params.id, req.params.registroId);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    return res.status(200).json(animal);
  } catch (error) {
    logger.error('Error borrando registro:', error);
    return res.status(500).json({ error: 'No se pudo borrar el registro' });
  }
}

async function uploadFoto(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen (campo "foto")' });
  try {
    const url = await photoService.publishAnimalPhoto(req.params.id, req.file.buffer, req.file.mimetype);
    if (url) {
      // Persistir la URL en el animal si existe.
      const existing = await animalService.getAnimal(req.params.id);
      if (existing) await animalService.upsertAnimal(req.params.id, { ...existing, fotoUrl: url });
    }
    return res.status(200).json({ fotoUrl: url }); // url puede ser null (S3 desactivado)
  } catch (error) {
    logger.error('Error subiendo foto:', error);
    return res.status(500).json({ error: 'No se pudo subir la foto' });
  }
}

module.exports = { getAll, getOne, upsert, remove, addRegistro, deleteRegistro, uploadFoto };
