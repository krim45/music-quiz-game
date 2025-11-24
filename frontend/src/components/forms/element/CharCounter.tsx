import clsx from 'clsx';

export interface CharCounterProps {
  className?: string;
  value: string | number;
  charLimit?: number;
  disabled?: boolean;
}

const CharCounter = ({ className = '', value = '', charLimit, disabled }: CharCounterProps) => {
  if (!charLimit) return null;

  return (
    <span className={clsx(disabled ? 'text-gray-500' : 'text-gray-400', className)}>
      {value.toString().length}/{charLimit}
    </span>
  );
};

export default CharCounter;
