interface Props {
  title: string;
  children: React.ReactNode;
}

export default function SubSection({ title, children }: Props) {
  return (
    <div className='mt-5 rounded-2xl border border-white/10 bg-black/30 p-5'>
      <h3 className='font-semibold text-white/90'>{title}</h3>
      <div className='mt-3'>{children}</div>
    </div>
  );
}
