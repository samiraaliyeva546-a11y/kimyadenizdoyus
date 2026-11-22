import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Shield, ShieldAlert, XCircle } from 'lucide-react';
import { PendingQuizChallenge } from '../types/game';
import { formatCoord } from '../utils/gameLogic';
import { soundFX } from '../utils/sound';

interface QuizModalProps {
  challenge: PendingQuizChallenge;
  timerSeconds: number; // 0 = unlimited
  onResolve: (isCorrect: boolean) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function QuizModal({ challenge, timerSeconds, onResolve }: QuizModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(timerSeconds);

  const answered = selectedIndex !== null || timedOut;
  const isCorrect = selectedIndex === challenge.question.correctIndex;

  useEffect(() => {
    setSelectedIndex(null);
    setTimedOut(false);
    setSecondsLeft(timerSeconds);
  }, [challenge, timerSeconds]);

  useEffect(() => {
    if (timerSeconds <= 0 || answered) return;
    if (secondsLeft <= 0) {
      setTimedOut(true);
      soundFX.playShieldDeflect();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timerSeconds, secondsLeft, answered]);

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);
    if (idx === challenge.question.correctIndex) {
      soundFX.playShieldBreak();
    } else {
      soundFX.playShieldDeflect();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!answered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          handleSelectOption(Number(e.key) - 1);
        } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
          const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
          handleSelectOption(map[e.key.toLowerCase()]);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onResolve(isCorrect);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0F1F36] shadow-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0B172A] px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-amber-300 truncate">
                {formatCoord(challenge.coord)} koordinatında gəmi qalxanı aktivləşdi
              </div>
              <h2
                id="quiz-modal-title"
                className="font-display text-base sm:text-lg font-bold text-slate-50 truncate"
              >
                {challenge.topic.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="font-mono-tabular text-sky-300 font-semibold">
              {challenge.topic.formulaSymbol}
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-slate-300">{challenge.question.difficulty}</span>
            {timerSeconds > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span
                  className={`flex items-center gap-1 font-mono-tabular font-semibold ${
                    secondsLeft <= 8 ? 'text-rose-400' : 'text-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {secondsLeft}s
                </span>
              </>
            )}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="text-xs text-slate-400">
            Qorunan gəmi: <span className="text-slate-200 font-medium">{challenge.targetShip.name}</span>
            {' · '}
            Qalxanı dəlmək və zərbəni təsdiqləmək üçün düzgün cavabı seçin.
          </div>

          <p className="text-base sm:text-lg font-semibold text-slate-50 leading-relaxed">
            {challenge.question.question}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {challenge.question.options.map((option, idx) => {
              const isSelected = selectedIndex === idx;
              const isOptionCorrect = idx === challenge.question.correctIndex;

              let btnStyle =
                'bg-[#0B172A] border-slate-700/80 text-slate-200 hover:border-sky-400 hover:bg-sky-950/40';
              if (answered) {
                if (isOptionCorrect) {
                  btnStyle = 'bg-emerald-950/70 border-emerald-400 text-emerald-100';
                } else if (isSelected && !isOptionCorrect) {
                  btnStyle = 'bg-rose-950/70 border-rose-400 text-rose-100';
                } else {
                  btnStyle = 'bg-[#0B172A]/60 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border text-left text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${btnStyle} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular text-xs font-bold w-6 h-6 rounded flex items-center justify-center bg-slate-800/90 text-slate-200 shrink-0">
                      {OPTION_LETTERS[idx]}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {answered && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                  )}
                  {answered && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation */}
          {answered && (
            <div
              className={`rounded-lg border p-4 space-y-2 ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-100'
                  : 'bg-amber-950/40 border-amber-700/70 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Doğru cavab! Gəmi qalxanı dəlindi və zərbə qeydə alındı.</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>
                      {timedOut
                        ? 'Vaxt bitdi! Gəmi qalxanı atışı dəf etdi.'
                        : 'Səhv cavab! Kimya qalxanı atışı dəf etdi (bu xanaya növbəti gedişdə yenidən ata bilərsiniz).'}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <strong className="font-semibold text-white">Elmi izah:</strong>{' '}
                {challenge.question.explanation}
              </p>
            </div>
          )}

          {answered && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onResolve(isCorrect)}
                className="px-6 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Döyüşə Davam Et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
