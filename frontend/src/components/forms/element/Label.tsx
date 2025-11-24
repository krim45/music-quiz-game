import clsx from 'clsx';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const Label = ({ className = '', id, label = '', required, disabled, ...rest }: LabelProps) => {
  if (label.length === 0) return null;

  return (
    <label htmlFor={id} className={clsx('flex h-4 min-w-0 flex-1 items-center gap-0.5', className)} {...rest}>
      {required && <span className={`${disabled ? 'text-gray-500' : 'text-red'}`}>*</span>}

      <span className={clsx('truncate', { 'text-gray-500': disabled })}>{label}</span>
    </label>
  );
};

export default Label;
