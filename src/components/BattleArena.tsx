import { Anchor, Crosshair, RotateCcw, Shield, Volume2, VolumeX } from 'lucide-react';
import { getTopicById } from '../data/chemistryTopics';
import {
  BattleLogEntry,
  Coordinate,
  GameConfig,
  PlayerBoardState,
} from '../types/game';
import { FleetGrid } from './FleetGrid';

interface BattleArenaProps {
  config: GameConfig;
  currentTurn: 1 | 2;
  activeViewer: 1 | 2;
  player1: PlayerBoardState;
  player2: PlayerBoardState;
  isAIThinking: boolean;
  lastShotOnP1: Coordinate | null;
  lastShotOnP2: Coordinate | null;
  battleLog: BattleLogEntry[];
  muted: boolean;
  onToggleMute: () => void;
  onFireShot: (coord: Coordinate) => void;
  onRestart: () => void;
}

export function BattleArena({
  config,
  currentTurn,
  activeViewer,
  player1,
  player2,
  isAIThinking,
  lastShotOnP1,
  lastShotOnP2,
  battleLog,
  muted,
  onToggleMute,
  onFireShot,
  onRestart,
}: BattleArenaProps) {
  const friendlyState = activeViewer === 1 ? player1 : player2;
  const enemyState = activeViewer === 1 ? player2 : player1;

  const isPlayerTurnToShoot =
    config.opponent === 'ai' ? currentTurn === 1 && !isAIThinking : currentTurn === activeViewer;

  const friendlyLastShot = activeViewer === 1 ? lastShotOnP1 : lastShotOnP2;
  const enemyLastShot = activeViewer === 1 ? lastShotOnP2 : lastShotOnP1;

  const enemyRemainingShips = enemyState.ships.filter((s) => !s.sunk).length;
  const friendlyRemainingShips = friendlyState.ships.filter((s) => !s.sunk).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 space-y-6">
      {/* Workspace Action & Turn Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0F1F36] px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Crosshair
              className={`w-4 h-4 ${isPlayerTurnToShoot ? 'text-amber-400' : 'text-sky-400'}`}
              aria-hidden="true"
            />
            <span className="text-sm sm:text-base font-semibold text-slate-50">
              {isAIThinking
                ? 'Kompüter növbəti hədəfi hesablayır...'
                : isPlayerTurnToShoot
                ? `${friendlyState.label}: Atış növbəsi səndədir`
                : `${enemyState.label} növbəsi`}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-300">
            {config.mode === 'quiz' ? 'Kimya Viktorinası Rejimi' : 'Klassik Rejim'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Səsi aç' : 'Səsi bağla'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0B172A] border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap"
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            )}
            <span>{muted ? 'Səssiz' : 'Səs Açıq'}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0B172A] border border-slate-700 hover:border-rose-400/80 hover:text-rose-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Yenidən Başla</span>
          </button>
        </div>
      </div>

      {/* Dual Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Enemy Target Waters (Primary Interactive Stage) */}
        <section
          className={`rounded-xl border p-4 sm:p-5 transition-colors ${
            isPlayerTurnToShoot
              ? 'border-amber-400/70 bg-[#0F1F36]'
              : 'border-slate-800 bg-[#0F1F36]/80'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-50">
                Rəqib Suları ({enemyState.label})
              </h2>
              <p className="text-xs text-slate-300">
                {config.mode === 'quiz'
                  ? 'Gəmiyə tuş gəldikdə qoruyucu kimya sualı açılacaq'
                  : 'Atəş açmaq üçün koordinat seçin'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono-tabular text-xs font-semibold text-amber-300">
                Qalan gəmi: {enemyRemainingShips}/5
              </span>
            </div>
          </div>

          <FleetGrid
            grid={enemyState.grid}
            ships={enemyState.ships}
            revealShips={false}
            interactive={isPlayerTurnToShoot}
            onCellClick={onFireShot}
            lastShotCoord={enemyLastShot}
            boardLabel="Rəqib döyüş xəritəsi"
          />

          {/* Compact Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
            <span>Boş atış: Dalğa</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-300">Vuruş: Alov / Lövbər</span>
            {config.mode === 'quiz' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300">Qalxanla dəf edilib: Qalxan (təkrar atış açıqdır)</span>
              </>
            )}
          </div>
        </section>

        {/* Friendly Fleet Waters */}
        <section className="rounded-xl border border-slate-800 bg-[#0F1F36] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-50">
                Sənin Donanman ({friendlyState.label})
              </h2>
              <p className="text-xs text-slate-400">
                Öz gəmilərinin vəziyyəti və rəqibin atış izləri
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono-tabular text-xs font-semibold text-sky-300">
                Sağlam gəmi: {friendlyRemainingShips}/5
              </span>
            </div>
          </div>

          <FleetGrid
            grid={friendlyState.grid}
            ships={friendlyState.ships}
            revealShips={true}
            interactive={false}
            lastShotCoord={friendlyLastShot}
            boardLabel="Öz donanma xəritən"
          />

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span>
              Atışlar: <strong className="font-mono-tabular text-white">{friendlyState.stats.shotsFired}</strong>
            </span>
            <span>
              Dəqiq zərbə: <strong className="font-mono-tabular text-emerald-300">{friendlyState.stats.hits}</strong>
            </span>
            {config.mode === 'quiz' && (
              <span>
                Kimya cavabı:{' '}
                <strong className="font-mono-tabular text-amber-300">
                  {friendlyState.stats.questionsCorrect}/{friendlyState.stats.questionsAnswered}
                </strong>
              </span>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Intelligence Row: Enemy Fleet Shield Tracker + Battle Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0F1F36] p-5">
          <h3 className="font-display text-base font-semibold text-slate-100 mb-3">
            Rəqib Gəmiləri və Qoruyucu Mövzular
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {enemyState.ships.map((ship) => {
              const topic = getTopicById(ship.topicId);
              return (
                <div
                  key={ship.templateId}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                    ship.sunk
                      ? 'bg-rose-950/35 border-rose-800/70 text-slate-400'
                      : 'bg-[#0B172A] border-slate-800 text-slate-100'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {ship.sunk ? (
                        <Anchor className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                      ) : config.mode === 'quiz' ? (
                        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                      ) : null}
                      <span className={`text-xs font-semibold truncate ${ship.sunk ? 'line-through' : ''}`}>
                        {ship.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {config.mode === 'quiz' ? topic.shortTitle : `${ship.size} xana`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: ship.size }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-xs ${
                          ship.sunk
                            ? 'bg-rose-500'
                            : idx < ship.hits
                            ? 'bg-rose-400'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0F1F36] p-5">
          <h3 className="font-display text-base font-semibold text-slate-100 mb-3">
            Son Döyüş Hərəkətləri
          </h3>
          {battleLog.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">
              Hələ atış edilməyib. Başlamaq üçün rəqib xəritəsində bir xanaya klikləyin.
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {battleLog.slice(0, 8).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-2 text-xs border-b border-slate-800/70 pb-2 last:border-b-0"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200">{entry.actorLabel}</span>
                    <span className="text-slate-400"> · {entry.message}</span>
                  </div>
                  <span className="font-mono-tabular text-[11px] font-semibold text-amber-300 shrink-0">
                    {entry.coordLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
