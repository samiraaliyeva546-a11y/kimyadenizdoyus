interface RulesViewProps {
  onGoToPlay: () => void;
}

export function RulesView({ onGoToPlay }: RulesViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="border-b border-slate-800 pb-5 space-y-1">
        <p className="text-xs font-medium text-sky-300">Oyun Bələdçisi</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
          Oyun Qaydaları və Mexanika
        </h1>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-800 bg-[#0F1F36] p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-slate-100">
            01. Donanmanın Yerləşdirilməsi
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hər oyunçunun 10×10 ölçülü dəniz xəritəsində 5 döyüş gəmisi olur: Fləqman (5 xana),
            Kreyser (4 xana), Eskadra (3 xana), Sualtı Qayıq (3 xana) və Gözətçi Kater (2 xana).
            Gəmiləri əl ilə üfüqi və ya şaquli yerləşdirə, yaxud &ldquo;Avtomatik Düz&rdquo; düyməsi
            ilə təsadüfi paylaya bilərsiniz.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-[#0F1F36] p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-slate-100">
            02. Kimya Viktorinası Rejimi (Fənn Qalxanları)
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Viktorina rejimində hər gəmi seçilmiş bir kimya mövzusu (məsələn, Dövri Sistem,
            Kimyəvi Rabitə, Məhlullar və pH, Üzvi Kimya) ilə qorunur. Rəqib xəritəsində boş suya
            atəş açdıqda növbə qarşı tərəfə keçir. Lakin gəmi xanasını vurduqda həmin gəminin
            kimya qalxanı aktivləşir:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1.5 pt-1">
            <li>
              <strong className="text-emerald-300">Doğru cavab:</strong> Qalxan dəlinir, zərbə
              təsdiqlənir və elmi izah göstərilir. Gəminin bütün xanaları vurulduqda gəmi batır.
            </li>
            <li>
              <strong className="text-amber-300">Səhv cavab:</strong> Gəminin kimya qalxanı
              atışı dəf edir. Xana xəritədə qalxan işarəsi ilə qeyd olunur və növbəti gedişdə
              həmin xanaya yenidən atəş açaraq yeni sualla qalxanı sındırmaq mümkündür.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-800 bg-[#0F1F36] p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-slate-100">
            03. Klassik Rejim və 2 Oyunçu Rejimi
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Klassik rejimdə kimya sualları olmadan birbaşa ənənəvi dəniz döyüşü oynanılır.
            &ldquo;2 Oyunçu (Eyni Ekran)&rdquo; seçimində hər gedişdən əvvəl məxfilik ekranı açılır ki,
            tələbələr bir-birinin gəmi mövqelərini görməsin.
          </p>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGoToPlay}
          className="px-6 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
        >
          Oynamağa Başla
        </button>
      </div>
    </div>
  );
}
