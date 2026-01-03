import { IconProps } from '@/types/icon';

const SortAsc = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24'>
        <title>sort-ascending</title>
        <path fill={fill} d='M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z' />
      </svg>
    </span>
  );
};

export default SortAsc;
