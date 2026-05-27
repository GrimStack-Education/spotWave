'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { Button, Checkbox, Input } from '@heroui/react';
import { Eye, Lock, Mail, UserRound } from 'lucide-react';
import { login, register } from '@/features/auth/api/auth.api';
import { setAccessToken } from '@/shared/lib/auth/session';
import { ErrorState } from '@/shared/ui/states/states';
import { PublicShell } from '@/widgets/public-shell';

const orangeButtonClassName =
 'h-15 rounded-full bg-[var(--sw-accent-3)] text-lg text-white transition-colors data-[hover=true]:bg-[var(--sw-accent-3)]';

const authInputClassName =
 'h-14 w-full rounded-[20px] border border-white/12 bg-[#111111] px-12 text-base text-white outline-none ring-0 transition-colors placeholder:text-white/30 focus:border-[var(--sw-accent-3)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0';

export function SignInScreen() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);

 const onSubmit = async () => {
 setError(null);
 try {
 const result = await login({ email, password });
 setAccessToken(result.accessToken);
 router.push('/onboarding');
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Sign in failed');
 }
 };

 return (
 <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-5 text-white md:px-8 md:py-8">
 <section className="relative mx-auto max-w-[1460px] overflow-hidden rounded-[34px] border border-white/10 bg-[#050505] px-6 py-7 md:px-10 md:py-10 xl:px-14 xl:py-12">
 <div className="relative flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#090909] px-5 py-3">
 <Image src="/brand/spotwave-logo.png" alt="SpotWave" width={46} height={46} priority />
 <span className="text-[30px]">
 Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
 </span>
 </div>
 <span className="rounded-full border border-white/12 px-4 py-2 text-xs tracking-[0.18em] text-white/72">
 ВХОД
 </span>
 </div>

 <div className="relative mt-10 grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
 <div className="max-w-[860px]">
 <h1 className="text-[58px] leading-[0.98] tracking-[-0.07em] text-white md:text-[84px] xl:text-[104px]">
 Находи
 <br />
 события
 <br />
 и <span className="text-[var(--sw-accent-3)]">своих</span>
 </h1>
 <p className="mt-6 max-w-[600px] text-lg leading-8 text-white/72 md:text-xl">
 Вход в SpotWave открывает локальные события, реальные сообщества и встречи рядом без лишнего шума.
 </p>
 </div>

 <div className="rounded-[30px] border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
 <h2 className="text-[44px] leading-[0.95] tracking-[-0.06em] text-white">
 С возвращением
 </h2>
 <p className="mt-4 text-[17px] leading-8 text-white/58">
 Войдите, чтобы открыть события рядом, чаты встреч и проверенные сообщества.
 </p>

 {error ? <div className="mt-6"><ErrorState message={error} /></div> : null}

 <div className="mt-8 space-y-4">
 <AuthField icon={<Mail className="text-white/38" size={19} />} label="Email">
 <Input
 className={authInputClassName}
 placeholder="name@mail.com"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </AuthField>
 <AuthField actionIcon={<Eye className="text-white/38" size={19} />} icon={<Lock className="text-white/38" size={19} />} label="Пароль">
 <Input
 className={authInputClassName}
 placeholder="Введите пароль"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 </AuthField>
 </div>

 <div className="mt-5 flex items-center justify-between gap-4">
 <Checkbox defaultSelected className="text-white/58" variant="secondary">
 Запомнить меня
 </Checkbox>
 <Link href="/forgot-password" className="text-sm text-[var(--sw-accent-3)]">
 Забыли пароль?
 </Link>
 </div>

 <Button fullWidth className={`${orangeButtonClassName} mt-7`} onPress={onSubmit}>
 Войти
 </Button>
 <p className="mt-5 text-center text-sm text-white/46">
 Еще нет аккаунта?{' '}
 <Link href="/sign-up" className="text-[var(--sw-accent-3)]">
 Создать
 </Link>
 </p>
 </div>
 </div>
 </section>
 </main>
 );
}

export function SignUpScreen() {
 const router = useRouter();
 const [username, setUsername] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);

 const onSubmit = async () => {
 setError(null);
 try {
 const result = await register({ name: username, email, password });
 setAccessToken(result.accessToken);
 router.push('/onboarding');
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Sign up failed');
 }
 };

 return (
 <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-5 text-white md:px-8 md:py-8">
 <section className="relative mx-auto max-w-[1460px] overflow-hidden rounded-[34px] border border-white/10 bg-[#050505] px-6 py-7 md:px-10 md:py-10 xl:px-14 xl:py-12">
 <div className="relative flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#090909] px-5 py-3">
 <Image src="/brand/spotwave-logo.png" alt="SpotWave" width={46} height={46} priority />
 <span className="text-[30px]">
 Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
 </span>
 </div>
 <span className="rounded-full border border-white/12 px-4 py-2 text-xs tracking-[0.18em] text-white/72">
 РЕГИСТРАЦИЯ
 </span>
 </div>

 <div className="relative mt-10 grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
 <div className="max-w-[860px]">
 <h1 className="text-[58px] leading-[0.98] tracking-[-0.07em] text-white md:text-[84px] xl:text-[104px]">
 Находи
 <br />
 события
 <br />
 и <span className="text-[var(--sw-accent-3)]">своих</span>
 </h1>
 <p className="mt-6 max-w-[600px] text-lg leading-8 text-white/72 md:text-xl">
 Создайте аккаунт SpotWave и откройте локальные события, реальные сообщества и встречи рядом без лишнего шума.
 </p>
 </div>

 <div className="rounded-[30px] border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
 <h2 className="text-[44px] leading-[0.95] tracking-[-0.06em] text-white">
 Создайте аккаунт
 </h2>
 <p className="mt-4 text-[17px] leading-8 text-white/58">
 Пара шагов, и вы внутри.
 </p>

 {error ? <div className="mt-6"><ErrorState message={error} /></div> : null}

 <div className="mt-8 space-y-4">
 <AuthField icon={<UserRound className="text-white/38" size={19} />} label="Имя пользователя">
 <Input className={authInputClassName} placeholder="Ваше имя" value={username} onChange={(e) => setUsername(e.target.value)} />
 </AuthField>
 <AuthField icon={<Mail className="text-white/38" size={19} />} label="Email">
 <Input className={authInputClassName} placeholder="name@mail.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
 </AuthField>
 <AuthField icon={<Lock className="text-white/38" size={19} />} label="Пароль">
 <Input className={authInputClassName} placeholder="Придумайте пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 </AuthField>
 </div>

 <Button fullWidth className={`${orangeButtonClassName} mt-7`} onPress={onSubmit}>
 Создать аккаунт
 </Button>
 <p className="mt-5 text-center text-sm text-white/46">
 Уже есть аккаунт?{' '}
 <Link href="/sign-in" className="text-[var(--sw-accent-3)]">
 Войти
 </Link>
 </p>
 </div>
 </div>
 </section>
 </main>
 );
}

export function ForgotPasswordScreen() {
 return (
 <PublicShell
 title="Сброс пароля"
 subtitle="Введите email и получите ссылку для безопасного восстановления доступа."
 topBadge="ПОМОЩЬ"
 >
 <AuthField icon={<Mail className="text-white/46" size={20} />} label="Email">
 <Input className={authInputClassName} placeholder="name@mail.com" type="email" />
 </AuthField>
 <Button fullWidth className={orangeButtonClassName}>Отправить ссылку</Button>
 <p className="text-sm text-white/48"><Link href="/sign-in" className="text-[var(--sw-accent-3)]">Вернуться ко входу</Link></p>
 </PublicShell>
 );
}

function AuthField({
 actionIcon,
 children,
 icon,
 label,
}: {
 actionIcon?: ReactNode;
 children: ReactElement;
 icon: ReactNode;
 label: string;
}) {
 return (
 <label className="block space-y-2">
 <span className="text-base text-white/70">{label}</span>
 <span className="relative block">
 <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">{icon}</span>
 {children}
 {actionIcon ? (
 <span className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2">{actionIcon}</span>
 ) : null}
 </span>
 </label>
 );
}
