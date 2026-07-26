const Animal = require('@models/Animal');

async function listAnimals() {
  const docs = await Animal.find().sort({ fechaEntrada: -1 });
  return docs.map(Animal.serialize);
}

async function getAnimal(id) {
  return Animal.serialize(await Animal.findOne({ id }));
}

// Upsert por la clave pública `id` (el UUID del front). Mantiene el contrato
// "guardar el animal completo" que usa el front.
async function upsertAnimal(id, data) {
  const doc = await Animal.findOneAndUpdate(
    { id },
    { ...data, id },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );
  return Animal.serialize(doc);
}

async function deleteAnimal(id) {
  await Animal.deleteOne({ id });
}

async function addRegistro(id, registro) {
  const doc = await Animal.findOneAndUpdate(
    { id },
    { $push: { registros: registro } },
    { new: true, runValidators: true },
  );
  return Animal.serialize(doc); // null si el animal no existe
}

async function removeRegistro(id, registroId) {
  const doc = await Animal.findOneAndUpdate(
    { id },
    { $pull: { registros: { _id: registroId } } },
    { new: true },
  );
  return Animal.serialize(doc);
}

module.exports = { listAnimals, getAnimal, upsertAnimal, deleteAnimal, addRegistro, removeRegistro };
