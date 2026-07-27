// models/Movimiento.js — contabilidad de la finca.
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { MOVIMIENTO_TIPOS, METODOS_PAGO } = require('@constants');

const movimientoSchema = new Schema({
  // Clave pública: el UUID generado por el front.
  id: { type: String, required: true, unique: true },
  fecha: { type: String, required: true }, // YYYY-MM-DD
  tipo: { type: String, required: true, enum: Object.values(MOVIMIENTO_TIPOS) },
  monto: { type: Number, required: true, min: 0 },
  concepto: { type: String, required: true, default: '' },
  metodo: { type: String, required: true, enum: Object.values(METODOS_PAGO), default: METODOS_PAGO.EFECTIVO },
  nota: { type: String, default: '' },
}, { timestamps: true });

movimientoSchema.index({ fecha: -1 });

function serialize(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.id,
    fecha: o.fecha,
    tipo: o.tipo,
    monto: o.monto,
    concepto: o.concepto ?? '',
    metodo: o.metodo,
    nota: o.nota || undefined,
  };
}

const MovimientoModel = model('Movimiento', movimientoSchema, 'movimientos');

module.exports = Object.assign(MovimientoModel, { serialize });
