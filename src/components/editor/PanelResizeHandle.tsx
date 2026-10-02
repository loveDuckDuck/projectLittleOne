import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { MIN_PANEL_WIDTH, panelWidthLimit, type PanelSide } from '../../hooks/usePanelLayout';

interface Props {
  side: PanelSide;
  width: number;
  disabled: boolean;
  layoutRef: RefObject<HTMLDivElement | null>;
  onResize: (width: number) => void;
}

export function PanelResizeHandle({ side, width, disabled, layoutRef, onResize }: Props) {
  const drag = useRef<{ pointerId: number; x: number; width: number; cursor: string; selection: string } | null>(null);
  const sign = side === 'blocks' ? 1 : -1;
  const limit = () => {
    const other = layoutRef.current?.querySelector<HTMLElement>(side === 'blocks' ? '.properties-panel' : '.blocks-panel')?.getBoundingClientRect().width ?? 48;
    return panelWidthLimit(layoutRef.current?.clientWidth ?? window.innerWidth, other);
  };
  const currentWidth = () => layoutRef.current?.querySelector<HTMLElement>(side === 'blocks' ? '.blocks-panel' : '.properties-panel')?.getBoundingClientRect().width ?? width;
  const clamp = (value: number) => Math.max(MIN_PANEL_WIDTH, Math.min(limit(), value));
  const finish = () => {
    if (!drag.current) return;
    document.body.style.cursor = drag.current.cursor;
    document.body.style.userSelect = drag.current.selection;
    drag.current = null;
  };
  useEffect(() => finish, []);

  function start(event: PointerEvent<HTMLDivElement>) {
    if (disabled || (event.button !== 0 && event.pointerType !== 'touch')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, x: event.clientX, width: currentWidth(), cursor: document.body.style.cursor, selection: document.body.style.userSelect };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    onResize(clamp(drag.current.width + (event.clientX - drag.current.x) * sign));
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') onResize(MIN_PANEL_WIDTH);
    else if (event.key === 'End') onResize(limit());
    else onResize(clamp(currentWidth() + (event.key === 'ArrowRight' ? 16 : -16) * sign));
  }

  if (disabled) return <div className="panel-resize-handle is-disabled" aria-hidden="true" />;
  return <div className="panel-resize-handle" role="separator" aria-label={`Ridimensiona ${side === 'blocks' ? 'libreria blocchi' : 'pannello proprietà'}`} aria-orientation="vertical" aria-valuemin={MIN_PANEL_WIDTH} aria-valuemax={limit()} aria-valuenow={Math.min(Math.round(width), limit())} tabIndex={0} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onKeyDown={keyDown} />;
}
