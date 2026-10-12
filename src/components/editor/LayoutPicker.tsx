import { presets } from '../../utils/layout';

const labels = ['Una colonna', 'Due colonne uguali', 'Colonna sinistra ampia', 'Colonna destra ampia', 'Colonna sinistra molto ampia', 'Colonna destra molto ampia', 'Tre colonne uguali'];
export function LayoutPicker({ widths, rowNumber, onChange }: { widths: number[]; rowNumber: number; onChange: (widths: readonly number[]) => void }) {
  return <details className="layout-picker"><summary aria-label={`Layout riga ${rowNumber}`}>Colonne</summary><div className="layout-picker-menu" role="group" aria-label={`Disposizione riga ${rowNumber}`}>
    {presets.map((preset, index) => <button type="button" key={index} aria-pressed={preset.length === widths.length && preset.every((width, i) => width === widths[i])} onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onChange(preset); }}>
      <span className="layout-miniature" aria-hidden="true" style={{ gridTemplateColumns: preset.map((width) => `${width}fr`).join(' ') }}>{preset.map((_, i) => <i key={i} />)}</span><span>{labels[index]}</span>
    </button>)}
  </div></details>;
}
