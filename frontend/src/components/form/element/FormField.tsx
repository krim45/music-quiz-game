import clsx from 'clsx';
import { inputSizes } from '@/constants/sizeToken';

import Label from '@/components/form/element/Label';
import HelperText from '@/components/form/element/HelperText';

import type { ReactNode } from 'react';
import type { InputSize } from '@/types/forms';

export interface FormFieldProps {
  className?: string;
  /** 테두리 박스에 덧붙일 클래스 */
  boxClassName?: string;
  size?: InputSize;
  /** 라벨이 가리킬 입력의 id */
  id?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
  helperText?: string;
  /** 라벨 줄 오른쪽에 붙는 요소 (글자 수 등) */
  labelAddon?: ReactNode;
  /** 내용이 늘어나면 박스 높이도 늘어난다 (태그 입력 등) */
  grow?: boolean;
  children: ReactNode;
}

/**
 * 입력 컴포넌트의 공통 틀: 라벨 줄 → 테두리 박스 → 도움말.
 *
 * 테두리 색 규칙과 간격을 여기 한 곳에 두어, 입력 종류가 달라도
 * 나란히 놓였을 때 줄이 어긋나지 않게 한다.
 */
export default function FormField({
  className,
  boxClassName,
  size = 'md',
  id,
  label = '',
  required,
  disabled,
  error,
  focused,
  helperText,
  labelAddon,
  grow,
  children,
}: FormFieldProps) {
  const sz = inputSizes[size];

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/*
        Label에 flex-1이 있어 세로 flex에 바로 넣으면 높이가 늘어난다.
        가로 flex로 한 번 감싸야 h-4가 지켜진다.
      */}
      {(label || labelAddon) && (
        <div className='flex justify-between'>
          <Label className={sz.label} id={id} label={label} required={required} disabled={disabled} />
          {labelAddon}
        </div>
      )}

      <div className='flex flex-col gap-1.5'>
        <div
          className={clsx(
            'relative flex w-full items-center rounded border',
            focused ? 'border-green' : error ? 'border-red' : 'border-gray-300',
            disabled && 'cursor-not-allowed bg-gray-100 text-gray-600',
            grow ? ['flex-wrap', sz.growWrapper] : sz.wrapper,
            boxClassName
          )}
        >
          {children}
        </div>

        <HelperText className={sz.helper} text={helperText} disabled={disabled} error={error} />
      </div>
    </div>
  );
}
