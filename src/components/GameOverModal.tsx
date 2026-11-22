import { useState } from 'react';
import { Award, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CHEMISTRY_TOPICS } from '../data/chemistryTopics';
import { ChemistryTopicId, GameMode, PlayerBoardState } from '../types/game';

interface GameOverModalProps {
  winner: PlayerBoardState;
  loser: PlayerBoardState;
  mode: GameMode;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function GameOverModal({
  winner,
  loser,
  mode,
  onPlayAgain,
  onBackToMenu,
}: GameOverModalProps) {
  const [crestError, setCrestError] = useState(false);

  const calcAccuracy = (p: PlayerBoardState) => {
    if (p.stats.shotsFired === 0) return 0;
    return Math.round((p.stats.hits / p.stats.shotsFired) * 100);
  };

  const topicBreakdown = (Object.keys(winner.stats.topicAttempts) as ChemistryTopicId[])
    .map((topicId) => {
      const topic = CHEMISTRY_TOPICS.find((t) => t.id === topicId);
      const record = winner.stats.topicAttempts[topicId];
      if (!topic || !record || record.asked === 0) return null;
      return { topic, record };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0F1F36] p-6 sm:p-8 space-y-6 my-auto">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-amber-400/50 bg-[#0B172A] shrink-0 flex items-center justify-center">
            {!crestError ? (
              <img
                src="/src/assets/images/naval_academy_crest_1795273386347.jpg"
                alt="Kimya Donanması qələbə nişanı"
                referrerPolicy="no-referrer"
                onError={() => setCrestError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Award className="w-10 h-10 text-amber-400" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-300">
              Döyüş Başa Çatdı · {mode === 'quiz' ? 'Kimya Viktorinası' : 'Klassik Rejim'}
            </p>
            <h2 id="gameover-title" className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
              Qalib: {winner.label}
            </h2>
            <p className="text-sm text-slate-300">
              {loser.label} donanmasının bütün 5 gəmisi batırıldı.
            </p>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[winner, loser].map((player, idx) => (
            <div
              key={player.id}
              className={`rounded-lg border p-4 space-y-2.5 ${
                idx === 0
                  ? 'bg-emerald-950/25 border-emerald-700/60'
                  : 'bg-[#0B172A] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">{player.label}</span>
                <span className="text-xs text-slate-400">
                  {idx === 0 ? 'Qalib' : 'Məğlub'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="block text-slate-400">Ümumi atış</span>
                  <span className="font-mono-tabular text-sm font-semibold text-slate-100">
                    {player.stats.shotsFired}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Dəqiqlik</span>
                  <span className="font-mono-tabular text-sm font-semibold text-sky-300">
                    {calcAccuracy(player)}%
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Batırılan gəmi</span>
                  <span className="font-mono-tabular text-sm font-semibold text-rose-300">
                    {player.stats.shipsSunk}/5
                  </span>
                </div>
                {mode === 'quiz' && (
                  <div>
                    <span className="block text-slate-400">Kimya cavabları</span>
                    <span className="font-mono-tabular text-sm font-semibold text-amber-300">
                      {player.stats.questionsCorrect}/{player.stats.questionsAnswered}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Topic Mastery Summary in Quiz Mode */}
        {mode === 'quiz' && topicBreakdown.length > 0 && (
          <div className="rounded-lg border border-slate-800 bg-[#0B172A] p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {winner.label} — Kimya Mövzuları Üzrə Nəticə
            </h3>
            <div className="space-y-2">
              {topicBreakdown.map(({ topic, record }) => (
                <div key={topic.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-200">{topic.title}</span>
                  <span className="font-mono-tabular font-semibold text-emerald-300">
                    {record.correct}/{record.asked} doğru
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Parametrlər</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Yenidən Oyna</span>
          </button>
        </div>
      </div>
    </div>
  );
}
