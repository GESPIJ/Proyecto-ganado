const Joi = require('joi');
const movimientoService = require('@services/movimientoService');
const logger = require('@modules/logger');
const { MOVIMIENTO_TIPOS, METODOS_PAGO, MOVIMIENTO_CATEGORIAS, CATEGORIA_NATURALEZA } = require('@constants');

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
  origen: categoria.allow(null).optional(),
  destino: categoria.allow(null).optional(),
  nota: Joi.string().allow('').optional(),
});

const esLiquida = (c) => CATEGORIA_NATURALEZA[c] === 'liquida';

// Valida reglas según el tipo. Devuelve un mensaje de error o null.
function validarPorTipo(v) {
  if (v.tipo === MOVIMIENTO_TIPOS.TRANSFERENCIA) {
    if (!v.origen || !v.destino) return 'La transferencia requiere origen y destino';
    if (v.origen === v.destino) return 'El origen y el destino deben ser distintos';
    v.desglose = [];
  } else if (v.tipo === MOVIMIENTO_TIPOS.VENTA || v.tipo === MOVIMIENTO_TIPOS.GASTO) {
    if (!esLiquida(v.categoria)) return `Solo una cuenta líquida (Mautes/Vacas/Otros) puede tener ${v.tipo}s`;
    v.desglose = [];
    v.origen = null;
    v.destino = null;
  } else {
    // aporte
    if (v.desglose && v.desglose.length > 0) {
      const suma = v.desglose.reduce((s, l) => s + l.monto, 0);
      if (Math.abs(suma - v.monto) > 0.01) return `El desglose (${suma}) no cuadra con el monto (${v.monto})`;
    }
    v.origen = null;
    v.destino = null;
  }
  return null;
}

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
  const reglaError = validarPorTipo(value);
  if (reglaError) return res.status(400).json({ error: reglaError });
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
