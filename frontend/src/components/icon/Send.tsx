import { IconProps } from '@/types/icon';

const Send = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24'>
        <title>send</title>
        <path d='M2,21L23,12L2,3V10L17,12L2,14V21Z' fill={fill} />
      </svg>
    </span>
  );
};

export default Send;
