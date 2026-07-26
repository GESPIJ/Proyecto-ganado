/**
 * Servicio de fotos — sube la imagen de un animal a un bucket S3 público y
 * devuelve su URL. Guarda solo la URL en Mongo.
 *
 * Fail-safe: si S3 no está configurado o la subida falla, devuelve null y loguea.
 * Nunca lanza.
 */
const crypto = require('crypto');
const logger = require('@modules/logger');

const REGION = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';

let cachedClient = null;

function getBucket() {
  return process.env.S3_ANIMAL_BUCKET || null;
}

function isConfigured() {
  return Boolean(getBucket());
}

function publicBaseUrl(bucket) {
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) return base.replace(/\/+$/, '');
  return `https://${bucket}.s3.${REGION}.amazonaws.com`;
}

// Token estable por animal (HMAC) para que re-subir sobreescriba el mismo objeto.
function token(seed) {
  const secret = process.env.API_KEY || 'ganado';
  return crypto.createHmac('sha256', secret).update(String(seed)).digest('hex').slice(0, 16);
}

function extFromMime(mime) {
  if (/png/.test(mime)) return 'png';
  if (/webp/.test(mime)) return 'webp';
  if (/heic/.test(mime)) return 'heic';
  return 'jpg';
}

function getClient() {
  if (cachedClient) return cachedClient;
  const { S3Client } = require('@aws-sdk/client-s3');
  cachedClient = new S3Client({ region: REGION });
  return cachedClient;
}

/**
 * Sube la foto de un animal. Devuelve la URL pública o null (nunca lanza).
 */
async function publishAnimalPhoto(animalId, body, contentType = 'image/jpeg') {
  const bucket = getBucket();
  if (!bucket) return null; // función desactivada — sin exposición, sin error
  if (!animalId || body == null) return null;

  const key = `animals/${animalId}-${token(animalId)}.${extFromMime(contentType)}`;
  try {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    await getClient().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=604800', // una semana; la key es estable por animal
    }));
    const url = `${publicBaseUrl(bucket)}/${key}`;
    logger.info(`[photoService] foto publicada ${animalId} -> ${url}`);
    return url;
  } catch (error) {
    logger.error(`[photoService] falló al publicar ${key}:`, error.message);
    return null;
  }
}

module.exports = { publishAnimalPhoto, isConfigured };
