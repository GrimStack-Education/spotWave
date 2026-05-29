'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, Lock, Mail, UserRound } from 'lucide-react';
import { login, register } from '@/features/auth/api/auth.api';
import { setAccessToken } from '@/shared/lib/auth/session';
import { toErrorMessage } from '@/shared/lib/api/error';
import { UiButton } from '@/shared/ui/button/button';
import { UiCheckbox } from '@/shared/ui/checkbox/checkbox';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState } from '@/shared/ui/states/states';

const orangeButtonClassName =
  'h-14 rounded-full bg-[var(--sw-accent-3)] text-base font-medium text-white !shadow-none transition-colors hover:!bg-[var(--sw-accent-3)] hover:!shadow-none focus:!bg-[var(--sw-accent-3)] focus:!shadow-none focus-visible:!border-transparent focus-visible:!bg-[var(--sw-accent-3)] focus-visible:!ring-0 focus-visible:!shadow-none active:!bg-[var(--sw-accent-3)] active:!shadow-none data-[hover=true]:bg-[var(--sw-accent-3)] md:h-16 md:text-lg';
const authInputClassName =
  'h-14 w-full rounded-[22px] border border-white/12 bg-[#101010] px-12 text-base text-white outline-none ring-0 transition-colors placeholder:text-white/32 focus:border-[var(--sw-accent-3)] md:h-16 md:rounded-[24px] md:px-14 md:text-lg';
const authCardClassName =
  'w-full rounded-[28px] border border-white/12 bg-[#161616] p-5 shadow-none md:rounded-[32px] md:p-9';
const authHeroGridClassName =
  'relative mt-6 grid items-start gap-6 xl:mt-10 xl:grid-cols-[minmax(0,620px)_minmax(560px,630px)] xl:items-center xl:gap-12';

export function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      router.push('/onboarding');
    },
    onError: (e) => setError(toErrorMessage(e)),
  });

  const onSubmit = () => {
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }
    setError(null);
    mutation.mutate({ email, password });
  };

  return (
    <AuthPage topBadge="ВХОД">
      <div className={authCardClassName}>
        <h2 className="text-[38px] leading-[0.98] tracking-[-0.04em] text-white md:text-[54px] md:tracking-[-0.06em]">
          С возвращением
        </h2>
        {error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-4 md:mt-8">
          <AuthField icon={<Mail className="text-white/38" size={19} />} label="Email">
            <UiInput
              className={authInputClassName}
              placeholder="name@mail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AuthField>
          <AuthField
            actionIcon={<Eye className="text-white/38" size={19} />}
            icon={<Lock className="text-white/38" size={19} />}
            label="Пароль"
          >
            <UiInput
              className={authInputClassName}
              placeholder="Введите пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthField>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 md:mt-6">
          <UiCheckbox defaultChecked label="Запомнить меня" />
          <Link href="/forgot-password" className="text-base text-[var(--sw-accent-3)]">
            Забыли пароль?
          </Link>
        </div>
        <UiButton
          fullWidth
          className={`${orangeButtonClassName} mt-6 md:mt-8`}
          onClick={onSubmit}
          isDisabled={mutation.isPending}
        >
          {mutation.isPending ? 'Входим...' : 'Войти'}
        </UiButton>
        <p className="mt-5 text-center text-base text-white/46 md:mt-7">
          Еще нет аккаунта?{' '}
          <Link href="/sign-up" className="text-[var(--sw-accent-3)]">
            Создать
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}

export function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      router.push('/onboarding');
    },
    onError: (e) => setError(toErrorMessage(e)),
  });

  const onSubmit = () => {
    if (!email || !password || password.length < 6) {
      setError('Проверьте email и пароль (минимум 6 символов)');
      return;
    }
    setError(null);
    mutation.mutate({ name: username.trim() || undefined, email, password });
  };

  return (
    <AuthPage topBadge="РЕГИСТРАЦИЯ">
      <div className={authCardClassName}>
        <h2 className="text-[38px] leading-[0.98] tracking-[-0.04em] text-white md:text-[52px] md:tracking-[-0.06em]">
          Создайте аккаунт
        </h2>
        {error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-4 md:mt-8">
          <AuthField
            icon={<UserRound className="text-white/38" size={19} />}
            label="Имя пользователя"
          >
            <UiInput
              className={authInputClassName}
              placeholder="Ваше имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </AuthField>
          <AuthField icon={<Mail className="text-white/38" size={19} />} label="Email">
            <UiInput
              className={authInputClassName}
              placeholder="name@mail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AuthField>
          <AuthField icon={<Lock className="text-white/38" size={19} />} label="Пароль">
            <UiInput
              className={authInputClassName}
              placeholder="Придумайте пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthField>
        </div>
        <UiButton
          fullWidth
          className={`${orangeButtonClassName} mt-6 md:mt-8`}
          onClick={onSubmit}
          isDisabled={mutation.isPending}
        >
          {mutation.isPending ? 'Создаем...' : 'Создать аккаунт'}
        </UiButton>
        <p className="mt-5 text-center text-base text-white/46 md:mt-7">
          Уже есть аккаунт?{' '}
          <Link href="/sign-in" className="text-[var(--sw-accent-3)]">
            Войти
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}

export function ForgotPasswordScreen() {
  return (
    <AuthPage topBadge="ПОМОЩЬ">
      <div className={authCardClassName}>
        <h2 className="text-[38px] leading-[0.98] tracking-[-0.04em] text-white md:text-[52px] md:tracking-[-0.06em]">
          Сброс пароля
        </h2>
        <p className="mt-4 max-w-[500px] text-base leading-7 text-white/58 md:text-lg md:leading-8">
          Введите email и получите ссылку для безопасного восстановления доступа.
        </p>
        <div className="mt-6 flex flex-col gap-5 md:mt-8">
          <AuthField icon={<Mail className="text-white/46" size={20} />} label="Email">
            <UiInput className={authInputClassName} placeholder="name@mail.com" type="email" />
          </AuthField>
          <UiButton fullWidth className={orangeButtonClassName}>
            Отправить ссылку
          </UiButton>
          <p className="text-base text-white/48">
            <Link href="/sign-in" className="text-[var(--sw-accent-3)]">
              Вернуться ко входу
            </Link>
          </p>
        </div>
      </div>
    </AuthPage>
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
    <label className="flex flex-col gap-3">
      <span className="text-base text-white/66 md:text-lg">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2">
          {icon}
        </span>
        {children}
        {actionIcon ? (
          <span className="pointer-events-none absolute right-5 top-1/2 z-10 -translate-y-1/2">
            {actionIcon}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function AuthPage({ children, topBadge }: { children: ReactNode; topBadge: string }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] px-3 py-3 text-white md:px-8 md:py-8">
      <section className="relative mx-auto max-w-[1460px] overflow-hidden rounded-[28px] border border-white/10 bg-[var(--background)] px-4 py-5 md:rounded-[34px] md:px-10 md:py-10 xl:px-12 xl:py-10">
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-[var(--sw-brand-capsule)] px-3 py-2 shadow-none md:gap-4 md:px-5 md:py-3">
            <Image
              src="/brand/spotwave-logo.png"
              alt="SpotWave"
              width={44}
              height={44}
              priority
              unoptimized
              className="md:h-[54px] md:w-[54px]"
            />
            <span className="text-[27px] leading-none md:text-[34px]">
              Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
            </span>
          </div>
          <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-white/54 md:text-sm md:tracking-[0.18em]">
            {topBadge}
          </span>
        </div>
        <div className={authHeroGridClassName}>
          <div className="max-w-[620px]">
            <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] text-white md:text-[84px] xl:text-[100px]">
              Находи
              <br />
              события
              <br />и <span className="text-[var(--sw-accent-3)]">своих</span>
            </h1>
            <p className="mt-4 max-w-[540px] text-base leading-7 text-white/58 md:mt-6 md:text-xl md:leading-8">
              Локальные события, живые сообщества и встречи рядом в одном аккуратном продукте.
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
