// Enums compartidos por el modelo y los controladores (Joi). Una sola fuente de verdad.
const ANIMAL_TIPOS = { VACA: 'vaca', MAUTE: 'maute', TORO: 'toro', CRIA: 'cria', NOVILLA: 'novilla' };
const ANIMAL_ESTADOS = { ACTIVO: 'activo', VENDIDO: 'vendido', MUERTO: 'muerto', MATADERO: 'matadero' };
const PROPOSITOS = { LECHE: 'leche', ENGORDE: 'engorde', CRIA: 'cria', REPRODUCCION: 'reproduccion', OTRO: 'otro' };
const REGISTRO_TIPOS = { PESO: 'peso', LECHE: 'leche' };

module.exports = { ANIMAL_TIPOS, ANIMAL_ESTADOS, PROPOSITOS, REGISTRO_TIPOS };
