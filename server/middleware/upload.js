// Subida de imágenes en memoria (el buffer se pasa directo a S3). Límite 5MB.
const multer = require('multer');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpe?g|png|webp|heic)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Formato de imagen no soportado')),
});
