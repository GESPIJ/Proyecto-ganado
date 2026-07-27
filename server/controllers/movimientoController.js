const Joi = require('joi');
const movimientoService = require('@services/movimientoService');
const logger = require('@modules/logger');
const { MOVIMIENTO_TIPOS, METODOS_PAGO } = require('@constants');

const dateStr = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);

const movimientoSchema = Joi.object({
  id: Joi.string().optional(), // la URL es la autoridad
  fecha: dateStr.required(),
  tipo: Joi.string().valid(...Object.values(MOVIMIENTO_TIPOS)).required(),
  monto: Joi.number().min(0).required(),
  concepto: Joi.string().allow('').default(''),
  metodo: Joi.string().valid(...Object.values(METODOS_PAGO)).default(METODOS_PAGO.EFECTIVO),
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
