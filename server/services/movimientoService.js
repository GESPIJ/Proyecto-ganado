const Movimiento = require('@models/Movimiento');

async function listMovimientos() {
  const docs = await Movimiento.find().sort({ fecha: -1, createdAt: -1 });
  return docs.map(Movimiento.serialize);
}

async function upsertMovimiento(id, data) {
  const doc = await Movimiento.findOneAndUpdate(
    { id },
    { ...data, id },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );
  return Movimiento.serialize(doc);
}

async function deleteMovimiento(id) {
  await Movimiento.deleteOne({ id });
}

module.exports = { listMovimientos, upsertMovimiento, deleteMovimiento };
