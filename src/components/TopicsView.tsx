import { ArrowRight, BookOpen } from 'lucide-react';
import { CHEMISTRY_TOPICS, FLEET_TEMPLATES } from '../data/chemistryTopics';
import { ChemistryQuestion, ChemistryTopicId } from '../types/game';

interface TopicsViewProps {
  allQuestions: ChemistryQuestion[];
  shipTopics: Record<string, ChemistryTopicId>;
  onOpenTopicInBank: (topicId: ChemistryTopicId) => void;
  onGoToPlay: () => void;
}

export function TopicsView({
  allQuestions,
  shipTopics,
  onOpenTopicInBank,
  onGoToPlay,
}: TopicsViewProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-sky-300">Tədris Proqramı</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Kimya Fənni Mövzuları
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Viktorina rejimində hər bir döyüş gəmisi aşağıdakı kimya bölmələrindən birinin
            sualları ilə qorunur. Mövzuları nəzərdən keçirib döyüşə hazırlaşın.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToPlay}
          className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
        >
          Oyun Meydanına Keç
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CHEMISTRY_TOPICS.map((topic) => {
          const count = allQuestions.filter((q) => q.topicId === topic.id).length;
          const assignedShips = FLEET_TEMPLATES.filter(
            (s) => (shipTopics[s.id] ?? s.defaultTopicId) === topic.id
          );

          return (
            <article
              key={topic.id}
              className="rounded-xl border border-slate-800 bg-[#0F1F36] p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">
                      <span className="font-mono-tabular text-amber-300 font-semibold">
                        {topic.formulaSymbol}
                      </span>
                      {' · '}
                      <span>{count} sual</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-slate-50">
                      {topic.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{topic.description}</p>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Əsas anlayışlar: </span>
                  {topic.keyConcepts.join(' · ')}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {assignedShips.length > 0 ? (
                    <span>
                      Hazırda qoruduğu gəmi:{' '}
                      <strong className="text-sky-300 font-medium">
                        {assignedShips.map((s) => s.name).join(', ')}
                      </strong>
                    </span>
                  ) : (
                    <span>Seçilə bilən əlavə mövzu</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenTopicInBank(topic.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Suallara Bax</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
