export function UiAvatar({ label, className }: { label: string; className?: string }) {
 const initials = label
 .split(' ')
 .map((v) => v[0])
 .join('')
 .slice(0, 2)
 .toUpperCase();

 return (
 <div className={['flex h-12 w-12 items-center justify-center rounded-2xl border border-white/14 bg-[#0f0f0f] text-sm text-white ', className ?? ''].join(' ')}>
 {initials}
 </div>
 );
}
