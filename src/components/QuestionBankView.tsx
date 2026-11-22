import { FormEvent, useMemo, useState } from 'react';
import { Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react';
import { CHEMISTRY_TOPICS, getTopicById } from '../data/chemistryTopics';
import { ChemistryQuestion, ChemistryTopicId, QuestionDifficulty } from '../types/game';

interface QuestionBankViewProps {
  allQuestions: ChemistryQuestion[];
  initialTopicFilter: ChemistryTopicId | 'all';
  onAddCustomQuestion: (question: ChemistryQuestion) => void;
  onDeleteCustomQuestion: (id: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function QuestionBankView({
  allQuestions,
  initialTopicFilter,
  onAddCustomQuestion,
  onDeleteCustomQuestion,
}: QuestionBankViewProps) {
  const [topicFilter, setTopicFilter] = useState<ChemistryTopicId | 'all'>(initialTopicFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newTopicId, setNewTopicId] = useState<ChemistryTopicId>('periodic_atomic');
  const [newDifficulty, setNewDifficulty] = useState<QuestionDifficulty>('Orta');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState<0 | 1 | 2 | 3>(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [formError, setFormError] = useState('');

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allQuestions.filter((q) => {
      if (topicFilter !== 'all' && q.topicId !== topicFilter) return false;
      if (!query) return true;
      return (
        q.question.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        q.options.some((o) => o.toLowerCase().includes(query))
      );
    });
  }, [allQuestions, topicFilter, searchQuery]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setFormError('Zəhmət olmasa sualı və bütün 4 cavab variantını doldurun.');
      return;
    }

    const created: ChemistryQuestion = {
      id: `custom-${Date.now()}`,
      topicId: newTopicId,
      question: newQuestionText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctIndex: correctIdx,
      difficulty: newDifficulty,
      explanation:
        newExplanation.trim() ||
        'Müəllim və ya tələbə tərəfindən əlavə edilmiş fərdi kimya sualı.',
      isCustom: true,
    };

    onAddCustomQuestion(created);
    setNewQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setNewExplanation('');
    setFormError('');
    setShowAddForm(false);
    setTopicFilter(newTopicId);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-sky-300">
            Hazırlıq və Müəllim Redaktoru · {allQuestions.length} Sual
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Kimya Sual Bazası
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Oyunda istifadə olunan sualları mövzular üzrə təkrarlayın və ya dərs proqramınıza
            uyğun yeni kimya sualları əlavə edin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{showAddForm ? 'Formanı Bağla' : 'Yeni Sual Əlavə Et'}</span>
        </button>
      </div>

      {/* Add Custom Question Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-700 bg-[#0F1F36] p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-50">
            Fərdi Kimya Sualı Yarat
          </h2>

          {formError && (
            <div className="rounded-lg border border-rose-500/70 bg-rose-950/40 px-4 py-2.5 text-xs text-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kimya Mövzusu
              </label>
              <select
                value={newTopicId}
                onChange={(e) => setNewTopicId(e.target.value as ChemistryTopicId)}
                className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {CHEMISTRY_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Çətinlik Səviyyəsi
              </label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="Asan">Asan</option>
                <option value="Orta">Orta</option>
                <option value="Çətin">Çətin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Sualın Mətni</label>
            <textarea
              rows={2}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Məsələn: Sulfat turşusunun (H₂SO₄) molyar kütləsi neçə q/mol-dur?"
              className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Variant A', val: optA, set: setOptA },
              { label: 'Variant B', val: optB, set: setOptB },
              { label: 'Variant C', val: optC, set: setOptC },
              { label: 'Variant D', val: optD, set: setOptD },
            ].map((item, idx) => (
              <div key={item.label}>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {item.label}
                </label>
                <input
                  type="text"
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Düzgün Variant
              </label>
              <select
                value={correctIdx}
                onChange={(e) => setCorrectIdx(Number(e.target.value) as 0 | 1 | 2 | 3)}
                className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value={0}>Variant A</option>
                <option value={1}>Variant B</option>
                <option value={2}>Variant C</option>
                <option value={3}>Variant D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Elmi İzah (İstəyə bağlı)
              </label>
              <input
                type="text"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Düzgün cavabın qısa izahı..."
                className="w-full bg-[#0B172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:text-white"
            >
              Ləğv Et
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
            >
              Sualı Yadda Saxla
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sual və ya termin axtar..."
            aria-label="Suallarda axtarış"
            className="w-full bg-[#0F1F36] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value as ChemistryTopicId | 'all')}
          aria-label="Mövzu üzrə filtr"
          className="bg-[#0F1F36] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="all">Bütün Kimya Mövzuları</option>
          {CHEMISTRY_TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Question List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F1F36] p-8 text-center text-sm text-slate-400">
          Axtarış şərtlərinə uyğun sual tapılmadı.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const topic = getTopicById(q.topicId);
            const isRevealed = revealedIds.has(q.id);

            return (
              <article
                key={q.id}
                className="rounded-xl border border-slate-800 bg-[#0F1F36] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-sky-300 font-medium">{topic.title}</span>
                    {' · '}
                    <span>{q.difficulty}</span>
                    {q.isCustom && (
                      <>
                        {' · '}
                        <span className="text-amber-300">Fərdi sual</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReveal(q.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Cavabı Gizlət</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Cavaba Bax</span>
                        </>
                      )}
                    </button>

                    {q.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomQuestion(q.id)}
                        aria-label="Fərdi sualı sil"
                        className="text-rose-400 hover:text-rose-300 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, idx) => {
                    const isAnswer = idx === q.correctIndex;
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isRevealed && isAnswer
                            ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-100 font-medium'
                            : 'bg-[#0B172A] border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-mono-tabular font-semibold text-slate-400 mr-2">
                          {OPTION_LETTERS[idx]}.
                        </span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {isRevealed && (
                  <p className="text-xs sm:text-sm text-slate-300 pt-1">
                    <strong className="text-slate-100">İzah:</strong> {q.explanation}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
