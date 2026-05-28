import Link from 'next/link';
import { PublicShell } from '@/widgets/public-shell';
import { UiButton } from '@/shared/ui/button/button';

export default function StartPage() {
 return (
 <PublicShell
 title="Начните в SpotWave"
 subtitle="Откройте события рядом, выберите формат встречи и присоединяйтесь в пару касаний."
 topBadge="СТАРТ"
 >
 <Link href="/sign-up" className="block"><UiButton className="h-14 w-full border border-[rgba(var(--sw-accent-2-rgb),0.55)] bg-[var(--sw-accent-3)] text-lg font-semibold text-white shadow-[0_0_0_1px_rgba(var(--sw-accent-2-rgb),0.45),0_14px_35px_rgba(var(--sw-accent-3-rgb),0.35)] hover:bg-[#ff8c1a]">Создать аккаунт</UiButton></Link>
 <Link href="/sign-in" className="block"><UiButton variant="outline" className="h-14 w-full text-lg">У меня уже есть аккаунт</UiButton></Link>

 <div className="flex items-center gap-6 text-xs uppercase tracking-[0.14em] text-white/55">
 <Link href="/terms" className="hover:text-[#ff7a00]">Условия</Link>
 <Link href="/privacy" className="hover:text-[#ff7a00]">Конфиденциальность</Link>
 </div>
 </PublicShell>
 );
}
