import { ActiveTab } from '../types/game';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewGame: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'play', label: 'Oyun Meydanı' },
  { id: 'topics', label: 'Fənn Mövzuları' },
  { id: 'bank', label: 'Sual Bazası' },
  { id: 'rules', label: 'Qaydalar' },
];

export function TopBar({ activeTab, onSelectTab, onNewGame }: TopBarProps) {
  return (
    <header className="border-b border-slate-800/80 bg-[#091426]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectTab('play')}
          className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
        >
          Kimya Donanması
        </button>

        <nav className="hidden md:flex items-center gap-6" aria-label="Əsas menyu">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded ${
                  isActive
                    ? 'text-sky-300 border-b-2 border-sky-400'
                    : 'text-slate-300 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewGame}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Yeni Oyun
          </button>
        </div>
      </div>

      {/* Mobile secondary single-row nav */}
      <nav className="flex md:hidden items-center justify-around border-t border-slate-800/80 px-2 py-2" aria-label="Mobil menyu">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 rounded transition-colors ${
                isActive ? 'text-sky-300 bg-slate-800/80' : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
