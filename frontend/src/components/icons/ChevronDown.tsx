import { IconProps } from '@/types/icon';

const ChevronDown = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 20 20' fill='none'>
        <path
          d='M15.2458 8.08748L14.0708 6.91248L10.2458 10.7291L6.42085 6.91248L5.24585 8.08747L10.2458 13.0875L15.2458 8.08748Z'
          fill={fill}
        />
      </svg>
    </span>
  );
};

export default ChevronDown;
