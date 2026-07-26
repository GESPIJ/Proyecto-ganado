// db.js — conexión a MongoDB (espejo de tv-alerts-automation).
const mongoose = require('mongoose');

// Nunca conectar a la DB real en un test run.
const isTestRun = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

async function connectDatabase(uri = process.env.DB_URI) {
  if (isTestRun) return mongoose;
  if (!uri) throw new Error('DB_URI is required');
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Conectado a la base de datos de ganado');
  });
  return mongoose;
}

module.exports = mongoose;
module.exports.connectDatabase = connectDatabase;
