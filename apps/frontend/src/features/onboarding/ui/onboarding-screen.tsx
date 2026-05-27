import { MapPin, Sparkles } from 'lucide-react';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiBadge } from '@/shared/ui/badge/badge';

const interests = ['Настолки', 'Бег', 'Языковые клубы', 'Искусство', 'Теннис', 'Стартапы'];
const radii = ['2 км', '5 км', '10 км'];

export function OnboardingScreen() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <UiCard className="space-y-6 p-6 md:p-8">
        <UiBadge className="w-fit border-[rgba(var(--sw-accent-2-rgb),0.30)] bg-[rgba(var(--sw-accent-4-rgb),0.12)] text-[var(--sw-accent-3)]"><Sparkles size={13} /> Настройка</UiBadge>
        <div>
          <h1 className="max-w-3xl text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Настройте локальный ритм</h1>
          <p className="mt-4 max-w-2xl text-white/60">Выберите интересы и радиус поиска перед входом в основную ленту SpotWave.</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-[0.1em] text-white/54">Интересы</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((item, index) => <UiBadge key={item} className={index < 3 ? 'border-[rgba(var(--sw-accent-2-rgb),0.30)] bg-[rgba(var(--sw-accent-4-rgb),0.12)] text-[var(--sw-accent-3)]' : ''}>{item}</UiBadge>)}
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-[0.1em] text-white/54">Радиус</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {radii.map((radius, index) => <UiButton key={radius} variant={index === 1 ? 'primary' : 'secondary'}>{radius}</UiButton>)}
          </div>
        </div>
        <UiButton className="h-14 w-full md:w-auto"><MapPin size={18} /> Разрешить геолокацию</UiButton>
      </UiCard>

      <UiCard className="p-6">
        <div className="h-64 rounded-[26px] border border-white/10 bg-[#0f0f0f]" />
        <h2 className="mt-5 text-2xl tracking-[-0.04em]">Лента станет точнее</h2>
        <p className="mt-2 text-white/56">SpotWave поднимает реальные события рядом выше бесконечного скролла.</p>
      </UiCard>
    </div>
  );
}
