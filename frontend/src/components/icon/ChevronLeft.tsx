import { IconProps } from '@/types/icon';

const ChevronLeft = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 20 20' fill='none'>
        <path d='M12.8416 6.175L11.6666 5L6.66663 10L11.6666 15L12.8416 13.825L9.02496 10L12.8416 6.175Z' fill={fill} />
      </svg>
    </span>
  );
};

export default ChevronLeft;
