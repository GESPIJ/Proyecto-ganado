// Enums compartidos por el modelo y los controladores (Joi). Una sola fuente de verdad.
const ANIMAL_TIPOS = { VACA: 'vaca', MAUTE: 'maute', TORO: 'toro', CRIA: 'cria', NOVILLA: 'novilla' };
const ANIMAL_ESTADOS = { ACTIVO: 'activo', VENDIDO: 'vendido', MUERTO: 'muerto', MATADERO: 'matadero' };
const PROPOSITOS = { LECHE: 'leche', ENGORDE: 'engorde', CRIA: 'cria', REPRODUCCION: 'reproduccion', OTRO: 'otro' };
const REGISTRO_TIPOS = { PESO: 'peso', LECHE: 'leche' };

// Contabilidad
const MOVIMIENTO_TIPOS = { APORTE: 'aporte', VENTA: 'venta', GASTO: 'gasto', TRANSFERENCIA: 'transferencia' };
const METODOS_PAGO = { EFECTIVO: 'efectivo', ZELLE: 'zelle', OTRO: 'otro' };
const MOVIMIENTO_CATEGORIAS = { MAUTES: 'mautes', VACAS: 'vacas', CAMION: 'camion', FINCA: 'finca', OTROS: 'otros' };
// Naturaleza de cada categoría (cuenta): liquida (acepta gastos/ventas) o inversion (solo suma).
const CATEGORIA_NATURALEZA = { mautes: 'liquida', vacas: 'liquida', otros: 'liquida', finca: 'inversion', camion: 'inversion' };
// Mapea tipos viejos (inversion/ingreso) a los nuevos, para datos ya guardados.
const TIPO_LEGADO = { inversion: 'aporte', ingreso: 'venta' };

module.exports = {
  ANIMAL_TIPOS,
  ANIMAL_ESTADOS,
  PROPOSITOS,
  REGISTRO_TIPOS,
  MOVIMIENTO_TIPOS,
  METODOS_PAGO,
  MOVIMIENTO_CATEGORIAS,
  CATEGORIA_NATURALEZA,
  TIPO_LEGADO,
};
