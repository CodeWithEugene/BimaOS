import Link from 'next/link';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ''}`}>
      <Image
        src="/BimaOS_logo_horizontal.png"
        alt="BimaOS"
        width={112}
        height={28}
        className="h-7 w-auto dark:brightness-0 dark:invert"
        priority
      />
    </Link>
  );
}
