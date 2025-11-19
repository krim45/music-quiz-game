export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const Label = ({ className = '', id, label = '', required, disabled, ...rest }: LabelProps) => {
  if (label.length === 0) return null;

  return (
    <label htmlFor={id} className={`inline-flex h-4 items-center gap-0.5 ${className}`} {...rest}>
      {required && <span className={`${disabled ? 'text-gray-500' : 'text-red'}`}>*</span>}

      <span className={`${disabled ? 'text-gray-500' : null}`}>{label}</span>
    </label>
  );
};

export default Label;
