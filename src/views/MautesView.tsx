import { useLocalState } from '../hooks/useLocalState';
import { NumField } from '../components/Field';
import ResultCard from '../components/ResultCard';
import ResultTable from '../components/ResultTable';
import Timeline from '../components/Timeline';
import { mauteProjection } from '../lib/maute';
import { MAUTE_DEFAULTS } from '../lib/defaults';
import { fmtDuracion, fmtKg, fmtMoney, fmtPct } from '../lib/format';

export default function MautesView() {
  const [input, setInput] = useLocalState('ganado.maute', MAUTE_DEFAULTS);
  const out = mauteProjection(input);
  const set = <K extends keyof typeof input>(k: K, v: (typeof input)[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const rendimientoBadge = out.mejorOpcion;

  return (
    <div className="view">
      <h2 className="sec">Datos de la inversión</h2>
      <div className="card">
        <div className="fieldgrid">
          <NumField label="Costo por kilo (compra)" value={input.costoPorKilo} onChange={(v) => set('costoPorKilo', v)} suffix="USD/kg" />
          <NumField label="Cantidad de mautes" value={input.cantidadMautes} onChange={(v) => set('cantidadMautes', v)} suffix="mautes" />
          <NumField label="Peso inicial c/u" value={input.pesoInicialPorMaute} onChange={(v) => set('pesoInicialPorMaute', v)} suffix="kg" />
          <NumField label="Peso objetivo c/u" value={input.pesoObjetivoPorMaute} onChange={(v) => set('pesoObjetivoPorMaute', v)} suffix="kg" />
          <NumField label="Kilos que suben al día" value={input.kilosSubenDia} onChange={(v) => set('kilosSubenDia', v)} suffix="kg/día" />
          <NumField label="Gastos pastos + admin." value={input.gastosPastosAdminMensual} onChange={(v) => set('gastosPastosAdminMensual', v)} suffix="USD/mes" help="Total del lote, por mes." />
        </div>
        <div className="proj">
          <div className="spread">
            <span className="mut">Inversión de compra</span>
            <strong>{fmtMoney(out.inversionCompra)}</strong>
          </div>
          <div className="spread" style={{ marginTop: 6 }}>
            <span className="mut">Gastos del periodo ({fmtDuracion(out.mesesEngorde)})</span>
            <strong>{fmtMoney(out.gastosPeriodo)}</strong>
          </div>
          <div className="spread" style={{ marginTop: 6 }}>
            <span className="mut">Costo total</span>
            <strong>{fmtMoney(out.costoTotal)}</strong>
          </div>
        </div>
      </div>

      <h2 className="sec">Precios de venta</h2>
      <div className="card">
        <NumField label="Rendimiento en canal" value={input.rendimientoCanalPct} onChange={(v) => set('rendimientoCanalPct', v)} suffix="%" help="% de carne aprovechable. Suele rondar el 50%." />
        <div className="fieldgrid">
          <NumField label="Precio por kilo en pie" value={input.precioKiloPie} onChange={(v) => set('precioKiloPie', v)} suffix="USD/kg" />
          <NumField label="Precio por kilo en canal" value={input.precioKiloCanal} onChange={(v) => set('precioKiloCanal', v)} suffix="USD/kg" />
        </div>
        <div className="help" style={{ marginTop: 4 }}>
          Peso final por animal: {fmtKg(out.pesoFinal)} · en canal: {fmtKg(out.pesoCanal)}
        </div>
      </div>

      <h2 className="sec">Comparación en pie vs. en canal</h2>
      <div className="hero">
        <ResultCard label="Utilidad en pie" value={fmtMoney(out.pie.utilidad)} sub={`ROI ${fmtPct(out.pie.roi)}`} tone={out.pie.utilidad >= 0 ? 'pos' : 'neg'} highlight={rendimientoBadge === 'pie'} />
        <ResultCard label="Utilidad en canal" value={fmtMoney(out.canal.utilidad)} sub={`ROI ${fmtPct(out.canal.roi)}`} tone={out.canal.utilidad >= 0 ? 'pos' : 'neg'} highlight={rendimientoBadge === 'canal'} />
      </div>

      <div className="card">
        <div className="spread">
          <strong>Mejor opción</strong>
          <span className="chip pos">{out.mejorOpcion === 'canal' ? 'Vender en canal' : 'Vender en pie'}</span>
        </div>
        <ResultTable
          title="En pie"
          rows={[
            { label: 'Ingreso total', value: fmtMoney(out.pie.ingreso) },
            { label: 'Costo total', value: fmtMoney(-out.costoTotal), tone: 'neg' },
            { label: 'Utilidad', value: fmtMoney(out.pie.utilidad), tone: out.pie.utilidad >= 0 ? 'pos' : 'neg', strong: true },
            { label: 'ROI', value: fmtPct(out.pie.roi) },
          ]}
        />
        <ResultTable
          title="En canal"
          rows={[
            { label: 'Ingreso total', value: fmtMoney(out.canal.ingreso) },
            { label: 'Costo total', value: fmtMoney(-out.costoTotal), tone: 'neg' },
            { label: 'Utilidad', value: fmtMoney(out.canal.utilidad), tone: out.canal.utilidad >= 0 ? 'pos' : 'neg', strong: true },
            { label: 'ROI', value: fmtPct(out.canal.roi) },
          ]}
        />
      </div>

      <h2 className="sec">Tiempo de engorde</h2>
      <Timeline title="Crecimiento hasta peso objetivo" timeline={out.timeline} note="Tiempo estimado para que cada maute llegue al peso objetivo con la ganancia diaria indicada." />
    </div>
  );
}
