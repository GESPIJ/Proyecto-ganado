// Enums compartidos por el modelo y los controladores (Joi). Una sola fuente de verdad.
const ANIMAL_TIPOS = { VACA: 'vaca', MAUTE: 'maute', TORO: 'toro', CRIA: 'cria', NOVILLA: 'novilla' };
const ANIMAL_ESTADOS = { ACTIVO: 'activo', VENDIDO: 'vendido', MUERTO: 'muerto', MATADERO: 'matadero' };
const PROPOSITOS = { LECHE: 'leche', ENGORDE: 'engorde', CRIA: 'cria', REPRODUCCION: 'reproduccion', OTRO: 'otro' };
const REGISTRO_TIPOS = { PESO: 'peso', LECHE: 'leche' };

// Contabilidad
const MOVIMIENTO_TIPOS = { INVERSION: 'inversion', INGRESO: 'ingreso', GASTO: 'gasto' };
const METODOS_PAGO = { EFECTIVO: 'efectivo', ZELLE: 'zelle', OTRO: 'otro' };

module.exports = {
  ANIMAL_TIPOS,
  ANIMAL_ESTADOS,
  PROPOSITOS,
  REGISTRO_TIPOS,
  MOVIMIENTO_TIPOS,
  METODOS_PAGO,
};
