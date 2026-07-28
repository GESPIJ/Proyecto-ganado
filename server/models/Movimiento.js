// models/Movimiento.js — contabilidad de la finca (cuentas con saldo).
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { MOVIMIENTO_TIPOS, METODOS_PAGO, MOVIMIENTO_CATEGORIAS, TIPO_LEGADO } = require('@constants');

// Línea de desglose por categoría (subdocumento con su propio _id).
const lineaSchema = new Schema({
  monto: { type: Number, required: true, min: 0 },
  categoria: { type: String, required: true, enum: Object.values(MOVIMIENTO_CATEGORIAS) },
  concepto: { type: String, default: '' },
});

const movimientoSchema = new Schema({
  // Clave pública: el UUID generado por el front.
  id: { type: String, required: true, unique: true },
  fecha: { type: String, required: true }, // YYYY-MM-DD
  // aporte | venta | gasto | transferencia (docs viejos: inversion/ingreso, mapeados al serializar).
  tipo: { type: String, required: true },
  monto: { type: Number, required: true, min: 0 },
  concepto: { type: String, required: true, default: '' },
  metodo: { type: String, enum: Object.values(METODOS_PAGO), default: METODOS_PAGO.EFECTIVO },
  // Para aporte/venta/gasto: categoría del total (si no hay desglose).
  categoria: { type: String, enum: Object.values(MOVIMIENTO_CATEGORIAS), default: MOVIMIENTO_CATEGORIAS.OTROS },
  // Desglose por categoría (solo aporte); si tiene líneas, su suma == monto.
  desglose: { type: [lineaSchema], default: [] },
  // Para transferencia: mueve monto de origen → destino.
  origen: { type: String, enum: Object.values(MOVIMIENTO_CATEGORIAS), default: null },
  destino: { type: String, enum: Object.values(MOVIMIENTO_CATEGORIAS), default: null },
  nota: { type: String, default: '' },
}, { timestamps: true });

movimientoSchema.index({ fecha: -1 });

function serialize(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.id,
    fecha: o.fecha,
    tipo: TIPO_LEGADO[o.tipo] || o.tipo, // mapea inversion→aporte, ingreso→venta
    monto: o.monto,
    concepto: o.concepto ?? '',
    metodo: o.metodo,
    categoria: o.categoria || 'otros',
    desglose: (o.desglose || []).map((l) => ({
      id: String(l._id),
      monto: l.monto,
      categoria: l.categoria,
      concepto: l.concepto || undefined,
    })),
    origen: o.origen ?? undefined,
    destino: o.destino ?? undefined,
    nota: o.nota || undefined,
  };
}

const MovimientoModel = model('Movimiento', movimientoSchema, 'movimientos');

module.exports = Object.assign(MovimientoModel, { serialize });
