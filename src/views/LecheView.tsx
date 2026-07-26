import { useLocalState } from '../hooks/useLocalState';
import { NumField } from '../components/Field';
import Slider from '../components/Slider';
import SocioInput from '../components/SocioInput';
import ResultCard from '../components/ResultCard';
import ResultTable from '../components/ResultTable';
import Timeline from '../components/Timeline';
import { milkProjection, categoriaEscenario } from '../lib/milk';
import { MILK_DEFAULTS } from '../lib/defaults';
import { fmtDuracion, fmtMoney, fmtNum, fmtPct } from '../lib/format';
import type { MilkScenario } from '../types';

export default function LecheView() {
  const [input, setInput] = useLocalState('ganado.milk', MILK_DEFAULTS);
  const out = milkProjection(input);
  const set = <K extends keyof typeof input>(k: K, v: (typeof input)[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const inversionAuto = input.costoPorVaca * input.cantidadVacas + input.inversionExtra;
  const usandoOverride = input.inversionOverride != null && input.inversionOverride > 0;

  const cat = categoriaEscenario(input.conservadorPct);

  const scenarioRows = (s: MilkScenario) => [
    { label: 'Ingreso mensual', value: fmtMoney(s.ingresoMensual) },
    { label: 'Costos básicos y admin.', value: fmtMoney(-s.costosMensual), tone: 'neg' as const },
    ...(input.socio.activo
      ? [{ label: 'Parte del socio', value: fmtMoney(-s.gananciaSocioMensual), tone: 'neg' as const }]
      : []),
    { label: 'Utilidad mensual', value: fmtMoney(s.utilidadMensual), tone: 'pos' as const, strong: true },
    { label: 'Utilidad anual', value: fmtMoney(s.utilidadAnual), tone: 'pos' as const },
    { label: 'ROI anual', value: fmtPct(s.roi) },
    { label: 'Recuperación', value: fmtDuracion(s.payback.meses) },
  ];

  return (
    <div className="view">
      <h2 className="sec">Datos de la inversión</h2>
      <div className="card">
        <div className="fieldgrid">
          <NumField label="Costo por vaca" value={input.costoPorVaca} onChange={(v) => set('costoPorVaca', v)} suffix="USD" />
          <NumField label="Cantidad de vacas" value={input.cantidadVacas} onChange={(v) => set('cantidadVacas', v)} suffix="vacas" />
          <NumField label="Litros/día por vaca" value={input.litrosDiaPorVaca} onChange={(v) => set('litrosDiaPorVaca', v)} suffix="L" />
          <NumField label="Inversión extra" value={input.inversionExtra} onChange={(v) => set('inversionExtra', v)} suffix="USD" help="Traslado, arreglos, etc." />
        </div>
        <div className="proj">
          <div className="spread">
            <span className="mut">Inversión total {usandoOverride ? '(manual)' : '(automática)'}</span>
            <strong>{fmtMoney(out.inversionTotal)}</strong>
          </div>
          <div className="btnrow">
            <button
              className={`btn${!usandoOverride ? ' pri' : ''}`}
              onClick={() => set('inversionOverride', null)}
            >
              Auto ({fmtMoney(inversionAuto)})
            </button>
            <button
              className={`btn${usandoOverride ? ' pri' : ''}`}
              onClick={() => set('inversionOverride', input.inversionOverride || inversionAuto)}
            >
              Manual
            </button>
          </div>
          {usandoOverride && (
            <div style={{ marginTop: 12 }}>
              <NumField label="Inversión total (manual)" value={input.inversionOverride ?? 0} onChange={(v) => set('inversionOverride', v)} suffix="USD" />
            </div>
          )}
        </div>
      </div>

      <h2 className="sec">Producción y precio</h2>
      <div className="card">
        <div className="fieldgrid">
          <NumField label="Vacas siendo ordeñadas" value={input.vacasOrdenadas} onChange={(v) => set('vacasOrdenadas', v)} suffix="vacas" help={`De las ${input.cantidadVacas} del hato`} />
          <NumField label="Precio de venta del litro" value={input.precioLitro} onChange={(v) => set('precioLitro', v)} suffix="USD/L" />
        </div>
        <div className="proj">
          <div className="spread">
            <span className="mut">Óptimo (100%) — {input.vacasOrdenadas} × {fmtNum(input.litrosDiaPorVaca)} L</span>
            <strong>{fmtNum(out.optimo.litrosDiaTotal)} L/día</strong>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Slider
            label="Escenario conservador"
            value={input.conservadorPct}
            onChange={(v) => set('conservadorPct', v)}
            min={40}
            max={100}
            step={5}
            badge={<span className={`chip ${cat.tono}`}>{cat.nombre} · {input.conservadorPct}%</span>}
            footLeft="% del óptimo"
            footRight={`${fmtNum(out.conservador.litrosDiaTotal)} L/día`}
          />
        </div>
        <NumField label="Costos básicos y administrativos" value={input.costosAdminPct} onChange={(v) => set('costosAdminPct', v)} suffix="%" help="Por defecto 15% de los ingresos." />
      </div>

      <SocioInput socio={input.socio} onChange={(s) => set('socio', s)} />

      <h2 className="sec">Resultados</h2>
      <div className="hero">
        <ResultCard label="Utilidad/mes — Óptimo" value={fmtMoney(out.optimo.utilidadMensual)} sub={`${fmtDuracion(out.optimo.payback.meses)} para recuperar`} tone="pos" highlight />
        <ResultCard label={`Utilidad/mes — ${cat.nombre} ${input.conservadorPct}%`} value={fmtMoney(out.conservador.utilidadMensual)} sub={`${fmtDuracion(out.conservador.payback.meses)} para recuperar`} tone="pos" />
      </div>

      <div className="card">
        <ResultTable title="Escenario óptimo (100%)" rows={scenarioRows(out.optimo)} />
        <ResultTable title={`Escenario ${cat.nombre.toLowerCase()} (${input.conservadorPct}%)`} rows={scenarioRows(out.conservador)} />
      </div>

      <h2 className="sec">Crías</h2>
      <Timeline
        title="Crecimiento de la cría"
        timeline={out.cria}
        note="Las vacas se venden con cría. Tiempo estimado para que la cría alcance peso de engorde (pasa a ser maute)."
      />
      <div className="card">
        <div className="fieldgrid">
          <NumField label="Peso al nacer" value={input.criaPesoNacimiento} onChange={(v) => set('criaPesoNacimiento', v)} suffix="kg" />
          <NumField label="Peso de engorde" value={input.criaPesoEngorde} onChange={(v) => set('criaPesoEngorde', v)} suffix="kg" />
          <NumField label="Ganancia diaria de la cría" value={input.criaGananciaDiaria} onChange={(v) => set('criaGananciaDiaria', v)} suffix="kg/día" />
        </div>
      </div>
    </div>
  );
}
