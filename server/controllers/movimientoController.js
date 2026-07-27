const Joi = require('joi');
const movimientoService = require('@services/movimientoService');
const logger = require('@modules/logger');
const { MOVIMIENTO_TIPOS, METODOS_PAGO, MOVIMIENTO_CATEGORIAS } = require('@constants');

const dateStr = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
const categoria = Joi.string().valid(...Object.values(MOVIMIENTO_CATEGORIAS));

const lineaSchema = Joi.object({
  id: Joi.string().optional(),
  monto: Joi.number().min(0).required(),
  categoria: categoria.required(),
  concepto: Joi.string().allow('').optional(),
});

const movimientoSchema = Joi.object({
  id: Joi.string().optional(), // la URL es la autoridad
  fecha: dateStr.required(),
  tipo: Joi.string().valid(...Object.values(MOVIMIENTO_TIPOS)).required(),
  monto: Joi.number().min(0).required(),
  concepto: Joi.string().allow('').default(''),
  metodo: Joi.string().valid(...Object.values(METODOS_PAGO)).default(METODOS_PAGO.EFECTIVO),
  categoria: categoria.default(MOVIMIENTO_CATEGORIAS.OTROS),
  desglose: Joi.array().items(lineaSchema).default([]),
  nota: Joi.string().allow('').optional(),
});

async function getAll(req, res) {
  try {
    return res.status(200).json(await movimientoService.listMovimientos());
  } catch (error) {
    logger.error('Error listando movimientos:', error);
    return res.status(500).json({ error: 'No se pudo listar la contabilidad' });
  }
}

async function upsert(req, res) {
  const { error, value } = movimientoSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details[0].message });
  // Si hay desglose, debe cuadrar con el total.
  if (value.desglose && value.desglose.length > 0) {
    const suma = value.desglose.reduce((s, l) => s + l.monto, 0);
    if (Math.abs(suma - value.monto) > 0.01) {
      return res.status(400).json({ error: `El desglose (${suma}) no cuadra con el monto (${value.monto})` });
    }
  }
  try {
    const mov = await movimientoService.upsertMovimiento(req.params.id, value);
    return res.status(200).json(mov);
  } catch (err) {
    logger.error('Error guardando movimiento:', err);
    return res.status(500).json({ error: 'No se pudo guardar el movimiento' });
  }
}

async function remove(req, res) {
  try {
    await movimientoService.deleteMovimiento(req.params.id);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error borrando movimiento:', error);
    return res.status(500).json({ error: 'No se pudo borrar el movimiento' });
  }
}

module.exports = { getAll, upsert, remove };
