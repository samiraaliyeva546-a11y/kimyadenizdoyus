import { EyeOff } from 'lucide-react';

interface PassDeviceOverlayProps {
  nextPlayerLabel: string;
  subtitle: string;
  buttonLabel: string;
  onContinue: () => void;
}

export function PassDeviceOverlay({
  nextPlayerLabel,
  subtitle,
  buttonLabel,
  onContinue,
}: PassDeviceOverlayProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="rounded-xl border border-slate-700 bg-[#0F1F36] p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <EyeOff className="w-7 h-7 text-amber-400" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-sky-300">2 Oyunçu Keçid Ekranı</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Cihazı {nextPlayerLabel} üçün ötürün
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
