import clsx from 'clsx';

interface Props {
  className?: string;
}

export default function SkeletonBlock({ className }: Props) {
  return <div className={clsx('animate-pulse bg-neutral-200/80', className)} />;
}
