import { IconProps } from '@/types/icon';

const Close = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 20 20' fill='none'>
        <path
          d='M15.8333 5.34169L14.6583 4.16669L9.99996 8.82502L5.34163 4.16669L4.16663 5.34169L8.82496 10L4.16663 14.6584L5.34163 15.8334L9.99996 11.175L14.6583 15.8334L15.8333 14.6584L11.175 10L15.8333 5.34169Z'
          fill={fill}
        />
      </svg>
    </span>
  );
};

export default Close;
