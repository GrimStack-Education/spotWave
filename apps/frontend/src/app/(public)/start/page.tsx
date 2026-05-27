import Link from 'next/link';
import { PublicShell } from '@/widgets/public-shell';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';

export default function StartPage() {
 return (
 <PublicShell
 title="Начните в SpotWave"
 subtitle="Откройте события рядом, выберите формат встречи и присоединяйтесь в пару касаний."
 topBadge="СТАРТ"
 >
 <UiCard className="p-4 text-base leading-relaxed text-white/75 md:text-lg">
 Простой поток: формат -&gt; место -&gt; детали -&gt; участие
 </UiCard>

 <Link href="/sign-up" className="block"><UiButton className="h-14 w-full text-lg">Создать аккаунт</UiButton></Link>
 <Link href="/sign-in" className="block"><UiButton variant="outline" className="h-14 w-full text-lg">У меня уже есть аккаунт</UiButton></Link>

 <div className="flex items-center gap-6 text-xs uppercase tracking-[0.14em] text-white/55">
 <Link href="/terms" className="hover:text-[#ff7a00]">Условия</Link>
 <Link href="/privacy" className="hover:text-[#ff7a00]">Конфиденциальность</Link>
 </div>
 </PublicShell>
 );
}
