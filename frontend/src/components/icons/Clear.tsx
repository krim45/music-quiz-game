import { IconProps } from '@/types/icon';

const Clear = ({ className = '', size = 20, fill = 'currentColor', ...rest }: IconProps) => {
  return (
    <span className={className} {...rest}>
      <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 20 20' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M1.66669 9.99999C1.66669 5.39999 5.40002 1.66666 10 1.66666C14.6 1.66666 18.3334 5.39999 18.3334 9.99999C18.3334 14.6 14.6 18.3333 10 18.3333C5.40002 18.3333 1.66669 14.6 1.66669 9.99999ZM6.49999 12.5176L7.48245 13.5L10.0088 10.9737L12.5175 13.5L13.5 12.5176L10.9737 9.99123L13.5 7.48246L12.5175 6.50001L10.0088 9.02632L7.48245 6.50001L6.49999 7.48246L9.02631 9.99123L6.49999 12.5176Z'
          fill={fill}
        />
      </svg>
    </span>
  );
};

export default Clear;
