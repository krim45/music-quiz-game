import clsx from 'clsx';

interface Props {
  className?: string;
  label?: string;
}

export default function OpenChat({ className, label = '개발자 문의' }: Props) {
  return (
    <a
      href='https://open.kakao.com/o/gIXXVHdi'
      target='_blank'
      rel='noreferrer'
      className={clsx('border border-white/20 bg-white/10 px-4 py-2 text-center text-sm hover:bg-white/15', className)}
    >
      {label}
    </a>
  );
}
