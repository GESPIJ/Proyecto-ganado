// models/Animal.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { ANIMAL_TIPOS, ANIMAL_ESTADOS, PROPOSITOS, REGISTRO_TIPOS } = require('@constants');

// Registro en el tiempo (peso o litros de leche) — subdocumento con su propio _id.
const registroSchema = new Schema({
  fecha: { type: String, required: true }, // YYYY-MM-DD
  tipo: { type: String, required: true, enum: Object.values(REGISTRO_TIPOS) },
  valor: { type: Number, required: true, min: 0 }, // kg (peso) | litros (leche)
  nota: { type: String, default: '' },
});

const animalSchema = new Schema({
  // Clave pública: el UUID generado por el front (crypto.randomUUID()).
  id: { type: String, required: true, unique: true },
  identificador: { type: String, required: true, default: 'Sin arete' },
  tipo: { type: String, required: true, enum: Object.values(ANIMAL_TIPOS), default: ANIMAL_TIPOS.MAUTE },
  estado: { type: String, required: true, enum: Object.values(ANIMAL_ESTADOS), default: ANIMAL_ESTADOS.ACTIVO },
  proposito: { type: String, required: true, enum: Object.values(PROPOSITOS), default: PROPOSITOS.OTRO },
  fechaEntrada: { type: String, required: true }, // YYYY-MM-DD
  fechaSalida: { type: String, default: null },
  fechaNacimiento: { type: String, default: null },
  pesoEntrada: { type: Number, required: true, min: 0, default: 0 },
  pesoActual: { type: Number, required: true, min: 0, default: 0 },
  costoCompra: { type: Number, required: true, min: 0, default: 0 },
  gastosAcumulados: { type: Number, required: true, min: 0, default: 0 },
  valorVenta: { type: Number, default: null },
  fotoUrl: { type: String, default: null },
  notas: { type: String, default: '' },
  registros: { type: [registroSchema], default: [] },
}, { timestamps: true });

// El índice único de `id` ya lo declara el campo (unique: true).
animalSchema.index({ estado: 1 });
animalSchema.index({ fechaEntrada: -1 });

/**
 * Convierte un documento Mongoose a la forma exacta que consume el front
 * (sin _id/__v; el _id de cada registro se expone como `id`).
 */
function serialize(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.id,
    identificador: o.identificador,
    tipo: o.tipo,
    estado: o.estado,
    proposito: o.proposito,
    fechaEntrada: o.fechaEntrada,
    fechaSalida: o.fechaSalida ?? undefined,
    fechaNacimiento: o.fechaNacimiento ?? undefined,
    pesoEntrada: o.pesoEntrada,
    pesoActual: o.pesoActual,
    costoCompra: o.costoCompra,
    gastosAcumulados: o.gastosAcumulados,
    valorVenta: o.valorVenta ?? undefined,
    fotoUrl: o.fotoUrl ?? null,
    notas: o.notas ?? '',
    registros: (o.registros || []).map((r) => ({
      id: String(r._id),
      fecha: r.fecha,
      tipo: r.tipo,
      valor: r.valor,
      nota: r.nota || undefined,
    })),
  };
}

const AnimalModel = model('Animal', animalSchema, 'ganado');

module.exports = Object.assign(AnimalModel, { serialize });
