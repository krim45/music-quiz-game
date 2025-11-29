import { IconProps } from '@/types/icon';

const Minus = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
      >
        <title>minus</title>
        <line x1='5' y1='12' x2='19' y2='12' /> {/* 둥근 minus */}
      </svg>
    </span>
  );
};

export default Minus;
