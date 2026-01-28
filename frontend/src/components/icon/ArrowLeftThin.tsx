import { IconProps } from '@/types/icon';

const ArrowLeftThin = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24'>
        <title>arrow-left-thin</title>
        <path d='M10.05 16.94V12.94H18.97L19 10.93H10.05V6.94L5.05 11.94Z' fill={fill} />
      </svg>
    </span>
  );
};

export default ArrowLeftThin;
