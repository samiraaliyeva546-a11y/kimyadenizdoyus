import { useState } from 'react';
import { BookOpen, Bot, Compass, Crosshair, Shield, Users } from 'lucide-react';
import { CHEMISTRY_TOPICS, FLEET_TEMPLATES, getTopicById } from '../data/chemistryTopics';
import { AIDifficulty, ChemistryTopicId, GameConfig, GameMode, OpponentType } from '../types/game';

interface SetupScreenProps {
  config: GameConfig;
  onChangeConfig: (next: GameConfig) => void;
  onStartPlacement: () => void;
  totalQuestionsCount: number;
}

export function SetupScreen({
  config,
  onChangeConfig,
  onStartPlacement,
  totalQuestionsCount,
}: SetupScreenProps) {
  const [heroImgError, setHeroImgError] = useState(false);

  const setMode = (mode: GameMode) => onChangeConfig({ ...config, mode });
  const setOpponent = (opponent: OpponentType) => onChangeConfig({ ...config, opponent });
  const setDifficulty = (aiDifficulty: AIDifficulty) => onChangeConfig({ ...config, aiDifficulty });

  const updateShipTopic = (shipId: string, topicId: ChemistryTopicId) => {
    onChangeConfig({
      ...config,
      shipTopics: {
        ...config.shipTopics,
        [shipId]: topicId,
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0F1F36] p-6 sm:p-8">
          <div className="space-y-4">
            <p className="text-xs font-medium text-sky-300 tracking-wide">
              Kimya Fənni Üzrə İnteraktiv Təhsil Oyunu · {totalQuestionsCount} Sual
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 leading-tight text-balance">
              Kimya Donanması ilə Dəniz Döyüşü
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Həm klassik dəniz döyüşü strategiyasını, həm də kimya mövzuları üzrə sual-cavab
              viktorinasını birləşdirən tələbə meydançası. Viktorina rejimində hər düşmən gəmisi
              konkret bir kimya mövzusunun qalxanı ilə qorunur — gəmini zədələmək üçün həmin
              mövzudan sualı düzgün cavablandırmalısan.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>5 Döyüş Gəmisi</span>
              <span aria-hidden="true">·</span>
              <span>7 Kimya Mövzusu</span>
              <span aria-hidden="true">·</span>
              <span>10×10 Taktiki Xəritə</span>
            </div>

            <button
              type="button"
              onClick={onStartPlacement}
              className="px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Donanmanı Yerləşdir
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B172A] min-h-[220px]">
          {!heroImgError ? (
            <img
              src="/src/assets/images/naval_hero_banner_1795273387578.jpg"
              alt="Kimya Donanması taktiki dəniz xəritəsi"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0F233F] to-[#081222] text-center">
              <Compass className="w-12 h-12 text-amber-400 mb-3" aria-hidden="true" />
              <p className="font-display text-lg font-semibold text-slate-100">
                Kimya Donanması Akademiyası
              </p>
              <p className="text-xs text-slate-400 mt-1">Taktiki Dəniz Döyüşü</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#091426]/90 via-[#091426]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
            <span className="font-medium">Fənn: Ümumi və Üzvi Kimya</span>
            <span className="font-mono-tabular text-amber-300">Mərhələ 1/2</span>
          </div>
        </div>
      </section>

      {/* Configuration Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mode & Opponent Settings */}
        <div className="lg:col-span-5 space-y-6 rounded-xl border border-slate-800 bg-[#0F1F36] p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
              Oyun Rejimini Seçin
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('quiz')}
                className={`text-left p-4 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  config.mode === 'quiz'
                    ? 'bg-sky-950/60 border-sky-400 text-slate-50'
                    : 'bg-[#0B172A] border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                  <span>Kimya Viktorinası</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hər gəmi bir kimya mövzusu sualları ilə qorunur. Qalxanı dəlmək üçün sualı cavabla.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('classic')}
                className={`text-left p-4 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  config.mode === 'classic'
                    ? 'bg-sky-950/60 border-sky-400 text-slate-50'
                    : 'bg-[#0B172A] border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                  <Crosshair className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Klassik Rejim</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ənənəvi Dəniz Döyüşü qaydaları — sual olmadan sürətli koordinat atışları.
                </p>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
              Rəqib Seçimi
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpponent('ai')}
                className={`flex items-center gap-2.5 p-3.5 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  config.opponent === 'ai'
                    ? 'bg-sky-950/60 border-sky-400 text-slate-50'
                    : 'bg-[#0B172A] border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Bot className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>Kompüterə Qarşı</span>
              </button>

              <button
                type="button"
                onClick={() => setOpponent('pvp')}
                className={`flex items-center gap-2.5 p-3.5 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  config.opponent === 'pvp'
                    ? 'bg-sky-950/60 border-sky-400 text-slate-50'
                    : 'bg-[#0B172A] border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>2 Oyunçu (Eyni Ekran)</span>
              </button>
            </div>

            {config.opponent === 'ai' && (
              <div className="mt-4">
                <span className="block text-xs font-medium text-slate-300 mb-2">
                  Kompüterin Çətinlik Səviyyəsi
                </span>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-[#0B172A] border border-slate-800">
                  {(
                    [
                      { id: 'easy', label: 'Asan' },
                      { id: 'medium', label: 'Orta' },
                      { id: 'hard', label: 'Çətin' },
                    ] as { id: AIDifficulty; label: string }[]
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id)}
                      className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        config.aiDifficulty === lvl.id
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-5 space-y-3">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <span className="block text-sm font-medium text-slate-100">
                  Dəqiq vuruşda əlavə atış
                </span>
                <span className="block text-xs text-slate-400">
                  Gəmini vurduqda növbə səndə qalsın
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.bonusTurnOnHit}
                onChange={(e) =>
                  onChangeConfig({ ...config, bonusTurnOnHit: e.target.checked })
                }
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            {config.mode === 'quiz' && (
              <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                  <span className="block text-sm font-medium text-slate-100">
                    Sual cavablandırma müddəti
                  </span>
                  <span className="block text-xs text-slate-400">
                    Limitsiz düşünmə və ya 30 saniyəlik sürətli test
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B172A] border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, quizTimerSeconds: 0 })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                      config.quizTimerSeconds === 0
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Limitsiz
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, quizTimerSeconds: 30 })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                      config.quizTimerSeconds === 30
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    30 san
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Fleet & Chemistry Topic Protection Mapping */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0F1F36] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 className="font-display text-lg font-semibold text-slate-100">
                Gəmilər və Qoruyucu Kimya Mövzuları
              </h2>
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                {config.mode === 'quiz' ? 'Viktorinada aktivdir' : 'Klassik rejimdə deaktivdir'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              {config.mode === 'quiz'
                ? 'Hər gəminin hansı kimya mövzusu ilə qorunacağını aşağıdan seçə və ya standart paylanmanı saxlaya bilərsiniz.'
                : 'Klassik rejimdə gəmilər sual olmadan birbaşa vurulur. Kimya suallarını aktivləşdirmək üçün soldan "Kimya Viktorinası" rejimini seçin.'}
            </p>

            <div className="divide-y divide-slate-800/90 border border-slate-800 rounded-lg bg-[#0B172A]">
              {FLEET_TEMPLATES.map((ship) => {
                const selectedTopicId = config.shipTopics[ship.id] ?? ship.defaultTopicId;
                const topic = getTopicById(selectedTopicId);

                return (
                  <div
                    key={ship.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
                        {Array.from({ length: ship.size }).map((_, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-xs bg-sky-400/80 border border-sky-200/40"
                          />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100 truncate">
                          {ship.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {ship.classLabel}
                          {config.mode === 'quiz' && (
                            <>
                              {' · '}
                              <span className="font-mono-tabular text-amber-300">
                                {topic.formulaSymbol}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {config.mode === 'quiz' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                        <select
                          aria-label={`${ship.name} üçün kimya mövzusu`}
                          value={selectedTopicId}
                          onChange={(e) =>
                            updateShipTopic(ship.id, e.target.value as ChemistryTopicId)
                          }
                          className="bg-[#11233D] border border-slate-700 text-slate-100 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 max-w-[240px]"
                        >
                          {CHEMISTRY_TOPICS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Sual qalxanı bağlıdır</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={onStartPlacement}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Donanmanı Yerləşdirməyə Başla
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
