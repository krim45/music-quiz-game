import { IconProps } from '@/types/icon';

const Resize = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 12 12' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M2.8049 10.973L10.9727 2.80524L11.6798 3.51234L3.512 11.6801L2.8049 10.973Z'
          fill={fill}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M7.09896 10.9219L10.9219 7.09894L11.629 7.80604L7.80607 11.629L7.09896 10.9219Z'
          fill={fill}
        />
      </svg>
    </span>
  );
};

export default Resize;
