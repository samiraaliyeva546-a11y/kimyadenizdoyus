import { Anchor, Flame, ShieldAlert, Waves } from 'lucide-react';
import { BoardCell, Coordinate, PlacedShip } from '../types/game';
import { COLUMN_LABELS, formatCoord } from '../utils/gameLogic';

interface FleetGridProps {
  grid: BoardCell[][];
  ships: PlacedShip[];
  revealShips: boolean;
  interactive: boolean;
  onCellClick?: (coord: Coordinate) => void;
  onCellHover?: (coord: Coordinate | null) => void;
  previewCells?: Coordinate[];
  previewValid?: boolean;
  lastShotCoord?: Coordinate | null;
  compact?: boolean;
  boardLabel: string;
}

export function FleetGrid({
  grid,
  ships,
  revealShips,
  interactive,
  onCellClick,
  onCellHover,
  previewCells = [],
  previewValid = true,
  lastShotCoord,
  compact = false,
  boardLabel,
}: FleetGridProps) {
  const previewSet = new Set(previewCells.map((c) => `${c.row}-${c.col}`));

  const getShipAt = (shipId: string | null): PlacedShip | undefined => {
    if (!shipId) return undefined;
    return ships.find((s) => s.templateId === shipId);
  };

  return (
    <div className="select-none" role="grid" aria-label={boardLabel}>
      {/* Column headers */}
      <div className="grid grid-cols-[1.75rem_repeat(10,minmax(0,1fr))] gap-1 mb-1">
        <div aria-hidden="true" />
        {COLUMN_LABELS.map((col) => (
          <div
            key={col}
            className="text-center font-mono-tabular text-[11px] sm:text-xs font-semibold text-slate-400"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {grid.map((rowCells, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-[1.75rem_repeat(10,minmax(0,1fr))] gap-1 items-center"
          >
            <div className="font-mono-tabular text-[11px] sm:text-xs font-semibold text-slate-400 text-right pr-1.5">
              {rowIdx + 1}
            </div>

            {rowCells.map((cell) => {
              const coord: Coordinate = { row: cell.row, col: cell.col };
              const coordKey = `${cell.row}-${cell.col}`;
              const isPreview = previewSet.has(coordKey);
              const ship = getShipAt(cell.shipId);
              const isSunk = Boolean(ship?.sunk);
              const isLastShot =
                lastShotCoord && lastShotCoord.row === cell.row && lastShotCoord.col === cell.col;

              const canClick =
                interactive && (cell.status === 'unshot' || cell.status === 'shielded' || revealShips);

              let bgClass = 'bg-[#0E2038] border-slate-700/70';
              if (cell.status === 'miss') {
                bgClass = 'bg-[#091628] border-slate-800 text-sky-400/70';
              } else if (cell.status === 'hit') {
                bgClass = isSunk
                  ? 'bg-rose-950/90 border-rose-500/80 text-rose-300'
                  : 'bg-rose-900/70 border-rose-400 text-rose-200';
              } else if (cell.status === 'shielded') {
                bgClass = 'bg-amber-950/75 border-amber-400/90 text-amber-300 hover:bg-amber-900/70';
              } else if (revealShips && cell.shipId) {
                bgClass = 'bg-slate-600/80 border-sky-400/70 text-slate-100';
              } else if (interactive) {
                bgClass = 'bg-[#0E2038] border-slate-700/80 hover:bg-sky-900/45 hover:border-sky-400/80';
              }

              if (isPreview) {
                bgClass = previewValid
                  ? 'bg-sky-500/40 border-sky-300'
                  : 'bg-rose-500/40 border-rose-400';
              }

              const sizeClasses = compact
                ? 'h-7 sm:h-8 text-xs'
                : 'h-8 sm:h-10 md:h-11 text-xs sm:text-sm';

              const coordLabel = formatCoord(coord);
              const stateText =
                cell.status === 'hit'
                  ? isSunk
                    ? 'Batırılmış gəmi'
                    : 'Vurulmuş hissə'
                  : cell.status === 'miss'
                  ? 'Boş atış'
                  : cell.status === 'shielded'
                  ? 'Kimya qalxanı ilə qorunan gəmi'
                  : revealShips && cell.shipId
                  ? ship?.name ?? 'Gəmi'
                  : 'Açıq dəniz';

              return (
                <button
                  key={coordKey}
                  type="button"
                  disabled={!canClick}
                  aria-label={`${coordLabel} — ${stateText}`}
                  title={`${coordLabel} · ${stateText}`}
                  onClick={() => canClick && onCellClick?.(coord)}
                  onMouseEnter={() => onCellHover?.(coord)}
                  onMouseLeave={() => onCellHover?.(null)}
                  className={`relative flex items-center justify-center rounded border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${sizeClasses} ${bgClass} ${
                    canClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
                  } ${isLastShot ? 'ring-2 ring-amber-300/90 ring-offset-1 ring-offset-[#091426]' : ''}`}
                >
                  {cell.status === 'miss' && (
                    <span className="animate-cell-pop flex items-center justify-center">
                      <Waves className="w-3.5 h-3.5 text-sky-400/65" aria-hidden="true" />
                    </span>
                  )}

                  {cell.status === 'hit' && (
                    <span className="animate-cell-pop flex items-center justify-center">
                      {isSunk ? (
                        <Anchor className="w-4 h-4 text-rose-300" aria-hidden="true" />
                      ) : (
                        <Flame className="w-4 h-4 text-rose-300" aria-hidden="true" />
                      )}
                    </span>
                  )}

                  {cell.status === 'shielded' && (
                    <span className="animate-cell-pop flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-amber-300" aria-hidden="true" />
                    </span>
                  )}

                  {cell.status === 'unshot' && revealShips && cell.shipId && !isPreview && (
                    <span className="w-2 h-2 rounded-sm bg-sky-200/80" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
