const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3090),
  DB_URI: Joi.string().uri().when('NODE_ENV', {
    is: 'test', then: Joi.optional(), otherwise: Joi.required(),
  }),
  API_KEY: Joi.string().min(24).when('NODE_ENV', {
    is: 'test', then: Joi.optional(), otherwise: Joi.required(),
  }),
  CORS_ORIGIN: Joi.string().default('*'),
  // Fotos (opcional): sin S3_ANIMAL_BUCKET la subida de fotos queda desactivada
  // y el endpoint devuelve fotoUrl:null (fail-safe). Se permite '' para poder
  // dejar las variables vacías en el .env sin romper el arranque.
  AWS_REGION: Joi.string().default('us-east-1'),
  S3_REGION: Joi.string().allow('').optional(),
  S3_ANIMAL_BUCKET: Joi.string().allow('').optional(),
  S3_PUBLIC_BASE_URL: Joi.string().uri().allow('').optional(),
  // Candado del módulo de contabilidad. Si faltan, el middleware falla cerrado
  // (503) y la contabilidad queda inaccesible; el resto de la app sigue igual.
  CONTA_USER: Joi.string().allow('').optional(),
  CONTA_KEY: Joi.string().allow('').optional(),
}).unknown(true);

function validateEnv(env = process.env) {
  const { error, value } = schema.validate(env, { abortEarly: false, convert: true });
  if (error) throw new Error(`Invalid environment configuration: ${error.details.map(d => d.message).join('; ')}`);
  return value;
}

module.exports = { validateEnv };
