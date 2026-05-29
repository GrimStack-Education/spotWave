import Image from 'next/image';

type CoverImageProps = {
  seed?: string;
  className?: string;
  alt?: string;
  priority?: boolean;
  src?: string | null;
};

const covers = [
  '/images/covers/city-night.svg',
  '/images/covers/street-music.svg',
  '/images/covers/cafe-talk.svg',
  '/images/covers/workshop.svg',
] as const;

function pickCover(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return covers[Math.abs(hash) % covers.length];
}

export function CoverImage({
  seed = 'spotwave',
  className,
  alt = 'Event cover',
  priority = false,
  src,
}: CoverImageProps) {
  return (
    <div className={[
      'relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]',
      className ?? '',
    ].join(' ')}>
      <Image
        src={src || pickCover(seed)}
        alt={alt}
        fill
        priority={priority}
        unoptimized={Boolean(src)}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
    </div>
  );
}
