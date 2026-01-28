import Link from 'next/link';
import clsx from 'clsx';
import ArrowLeftThin from '@/components/icon/ArrowLeftThin';

interface Props {
  href: string;
  size?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function GoBack({ className, href, size = 20, children }: Props) {
  return (
    <Link className={clsx('inline-flex items-center gap-2 text-gray-300 hover:text-white', className)} href={href}>
      <ArrowLeftThin size={size} />
      {children}
    </Link>
  );
}
