import { IconProps } from '@/types/icon';

const Menu = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24'>
        <title>menu</title>
        <path d='M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z' fill={fill} />
      </svg>
    </span>
  );
};

export default Menu;
