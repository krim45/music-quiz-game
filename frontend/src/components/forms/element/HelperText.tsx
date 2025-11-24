import clsx from 'clsx';

export interface HelperTextProps {
  className?: string;
  text?: string;
  error?: boolean;
  disabled?: boolean;
}

const HelperText = ({ className = '', text = '', error, disabled }: HelperTextProps) => {
  if (text.length === 0) return null;

  return (
    <span
      className={clsx(
        disabled ? 'text-gray-500' : error ? 'text-red' : 'text-gray-50',
        'whitespace-pre-line',
        className
      )}
    >
      {text}
    </span>
  );
};

export default HelperText;
