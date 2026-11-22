import { useEffect, useState } from 'react';
import { Check, RotateCw, Shuffle, Trash2 } from 'lucide-react';
import { FLEET_TEMPLATES, getTopicById } from '../data/chemistryTopics';
import {
  ChemistryTopicId,
  Coordinate,
  GameMode,
  Orientation,
  PlayerBoardState,
} from '../types/game';
import {
  autoPlaceFleet,
  canPlaceShip,
  computeShipCells,
  createEmptyPlayerState,
  placeShipOnState,
  removeShipFromState,
} from '../utils/gameLogic';
import { soundFX } from '../utils/sound';
import { FleetGrid } from './FleetGrid';

interface PlacementPhaseProps {
  playerState: PlayerBoardState;
  mode: GameMode;
  shipTopics: Record<string, ChemistryTopicId>;
  onUpdateState: (next: PlayerBoardState) => void;
  onConfirmFleet: () => void;
  onBackToMenu: () => void;
}

export function PlacementPhase({
  playerState,
  mode,
  shipTopics,
  onUpdateState,
  onConfirmFleet,
  onBackToMenu,
}: PlacementPhaseProps) {
  const [selectedShipId, setSelectedShipId] = useState<string>(FLEET_TEMPLATES[0].id);
  const [orientation, setOrientation] = useState<Orientation>('H');
  const [hoverCoord, setHoverCoord] = useState<Coordinate | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'h' || e.key === 'H') {
        setOrientation((prev) => (prev === 'H' ? 'V' : 'H'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedTemplate =
    FLEET_TEMPLATES.find((s) => s.id === selectedShipId) ?? FLEET_TEMPLATES[0];

  const placedShipIds = new Set(playerState.ships.map((s) => s.templateId));
  const allPlaced = playerState.ships.length === FLEET_TEMPLATES.length;

  const previewCells =
    hoverCoord && !placedShipIds.has(selectedTemplate.id)
      ? computeShipCells(hoverCoord, selectedTemplate.size, orientation)
      : [];

  const previewValid =
    hoverCoord && !placedShipIds.has(selectedTemplate.id)
      ? canPlaceShip(playerState.grid, hoverCoord, selectedTemplate.size, orientation)
      : false;

  const handleCellClick = (coord: Coordinate) => {
    const clickedCell = playerState.grid[coord.row][coord.col];

    // Clicking an already placed ship picks it up so the player can reposition it
    if (clickedCell.shipId) {
      const existingId = clickedCell.shipId;
      onUpdateState(removeShipFromState(playerState, existingId));
      setSelectedShipId(existingId);
      return;
    }

    if (placedShipIds.has(selectedTemplate.id)) return;

    if (!canPlaceShip(playerState.grid, coord, selectedTemplate.size, orientation)) {
      return;
    }

    const topicId = shipTopics[selectedTemplate.id] ?? selectedTemplate.defaultTopicId;
    const nextState = placeShipOnState(
      playerState,
      selectedTemplate,
      coord,
      orientation,
      topicId
    );
    soundFX.playPlaceShip();
    onUpdateState(nextState);

    // Auto-select next unplaced ship
    const nextUnplaced = FLEET_TEMPLATES.find(
      (t) => t.id !== selectedTemplate.id && !nextState.ships.some((s) => s.templateId === t.id)
    );
    if (nextUnplaced) {
      setSelectedShipId(nextUnplaced.id);
    }
  };

  const handleAutoPlace = () => {
    const randomized = autoPlaceFleet(playerState.id, playerState.label, shipTopics);
    soundFX.playPlaceShip();
    onUpdateState(randomized);
  };

  const handleClear = () => {
    onUpdateState(createEmptyPlayerState(playerState.id, playerState.label));
    setSelectedShipId(FLEET_TEMPLATES[0].id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-medium text-sky-300">
            Mərhələ 1/2 · {mode === 'quiz' ? 'Kimya Viktorinası Rejimi' : 'Klassik Rejim'}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-50 mt-0.5">
            {playerState.label}: Donanmanı Yerləşdir
          </h1>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          Parametrlərə Qayıt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Grid */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0F1F36] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-sm font-medium text-slate-200">
              Xəritədə xana seçin (yerləşdirilmiş gəmiyə klikləyib yenidən köçürə bilərsiniz)
            </span>
            <span className="font-mono-tabular text-xs text-sky-300">
              {playerState.ships.length} / {FLEET_TEMPLATES.length} gəmi
            </span>
          </div>

          <FleetGrid
            grid={playerState.grid}
            ships={playerState.ships}
            revealShips={true}
            interactive={true}
            onCellClick={handleCellClick}
            onCellHover={setHoverCoord}
            previewCells={previewCells}
            previewValid={previewValid}
            boardLabel={`${playerState.label} yerləşdirmə xəritəsi`}
          />
        </div>

        {/* Fleet Dock & Controls */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0F1F36] p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOrientation((prev) => (prev === 'H' ? 'V' : 'H'))}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-[#0B172A] border border-slate-700 hover:border-sky-400 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>İstiqamət: {orientation === 'H' ? 'Üfüqi (H)' : 'Şaquli (V)'}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoPlace}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-[#0B172A] border border-slate-700 hover:border-amber-400 rounded-lg transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Avtomatik Düz</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#0B172A] border border-slate-800 hover:border-rose-400/70 hover:text-rose-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Təmizlə</span>
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Donanma Gəmiləri
            </h2>
            <div className="space-y-2">
              {FLEET_TEMPLATES.map((template) => {
                const isPlaced = placedShipIds.has(template.id);
                const isSelected = selectedShipId === template.id && !isPlaced;
                const topic = getTopicById(shipTopics[template.id] ?? template.defaultTopicId);

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      if (isPlaced) {
                        onUpdateState(removeShipFromState(playerState, template.id));
                      }
                      setSelectedShipId(template.id);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 text-white'
                        : isPlaced
                        ? 'bg-emerald-950/30 border-emerald-700/60 text-slate-200 hover:border-amber-400/70'
                        : 'bg-[#0B172A] border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{template.name}</span>
                        {isPlaced && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {template.size} xana
                        {mode === 'quiz' ? ` · ${topic.shortTitle}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
                      {Array.from({ length: template.size }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-xs border ${
                            isPlaced
                              ? 'bg-emerald-400/80 border-emerald-200/40'
                              : isSelected
                              ? 'bg-sky-400 border-sky-200/50'
                              : 'bg-slate-600 border-slate-500'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 pt-1">
              İpucu: Klaviatura ilə döndərmək üçün <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono-tabular">R</kbd> düyməsinə basın.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={!allPlaced}
              onClick={onConfirmFleet}
              className={`w-full py-3 px-5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                allPlaced
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {allPlaced ? 'Hazıram — Döyüşü Başlat' : 'Bütün 5 Gəmini Yerləşdirin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
