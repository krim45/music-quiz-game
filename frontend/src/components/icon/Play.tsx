import { IconProps } from '@/types/icon';

const Play = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24'>
        <title>play</title>
        <path d='M8,5.14V19.14L19,12.14L8,5.14Z' fill={fill} />
      </svg>
    </span>
  );
};

export default Play;
