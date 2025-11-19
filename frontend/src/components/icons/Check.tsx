import { IconProps } from '@/types/icon';

const Check = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 20 20' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M16.7425 6.60107L15.399 5.25757L8.50003 12.1565L5.10107 8.75757L3.75757 10.1011L8.50003 14.8435L16.7425 6.60107Z'
          fill={fill}
        />
      </svg>
    </span>
  );
};

export default Check;
