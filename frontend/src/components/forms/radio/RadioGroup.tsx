import { useId, Children, isValidElement, cloneElement, ReactElement } from 'react';
import Radio, { RadioProps } from '@/components/forms/radio/Radio';
import clsx from 'clsx';

export interface RadioGroupProps<T extends string | boolean | number> {
  className?: string;
  children: React.ReactNode;
  name?: string;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

const RadioGroup = <T extends string | number | boolean>({
  name,
  value,
  disabled,
  className,
  children,
  onChange,
}: RadioGroupProps<T>) => {
  const groupName = name ? name : useId().replace(/:/g, '');

  const clonedChildren = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== Radio) return child;

    const radioChild = child as ReactElement<RadioProps<T>>;

    return cloneElement(radioChild, {
      name: groupName,
      checked: radioChild.props.value === value,
      onChange: (value) => onChange(value),
      disabled: disabled || radioChild.props.disabled,
    });
  });

  return <div className={clsx('w-full flex justify-around', className)}>{clonedChildren}</div>;
};

export default RadioGroup;
