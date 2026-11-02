export const inputSizes = {
  sm: {
    wrapper: 'h-8', // height: 32px
    growWrapper: 'min-h-8', // 내용에 따라 늘어나는 입력(태그 등)의 최소 높이
    inset: 'px-2', // 입력 박스 안쪽 좌우 여백 (input 패딩과 같다)
    text: 'text-sm', // 입력 글자 크기만 (패딩을 따로 줄 때)
    input: 'text-sm px-2', // font-size: 14px, padding-left/right: 8px
    label: 'text-base', // font-size: 16px
    helper: 'text-[10px]', // font-size: 10px
    icon: 'w-4 h-4', // width/height: 16px
  },
  md: {
    wrapper: 'h-10', // height: 40px  (기본)
    growWrapper: 'min-h-10', // 내용에 따라 늘어나는 입력(태그 등)의 최소 높이
    inset: 'px-2', // 입력 박스 안쪽 좌우 여백 (input 패딩과 같다)
    text: 'text-base', // 입력 글자 크기만 (패딩을 따로 줄 때)
    input: 'text-base px-2', // font-size: 16px, padding-left/right: 8px
    label: 'text-lg', // font-size: 18px
    helper: 'text-xs', // font-size: 12px
    icon: 'w-5 h-5', // width/height: 20px
  },
  lg: {
    wrapper: 'h-12', // height: 48px
    growWrapper: 'min-h-12', // 내용에 따라 늘어나는 입력(태그 등)의 최소 높이
    inset: 'px-3', // 입력 박스 안쪽 좌우 여백 (input 패딩과 같다)
    text: 'text-lg', // 입력 글자 크기만 (패딩을 따로 줄 때)
    input: 'text-lg px-3', // font-size: 18px, padding-left/right: 12px
    label: 'text-xl', // font-size: 20px
    helper: 'text-sm', // font-size: 14px
    icon: 'w-6 h-6', // width/height: 24px
  },
};

export const buttonSizes = {
  sm: {
    wrapper: 'h-8 px-1 text-sm', // height 32px, padding 4px, font 14px
  },
  md: {
    wrapper: 'h-10 px-2 text-base', // height 40px, padding 8px, font 16px (디폴트)
  },
  lg: {
    wrapper: 'h-12 px-3 text-lg', // height 48px, padding 12px, font 18px
  },
};

export const checkboxSizes = {
  sm: {
    box: 'h-3.5 w-3.5',
    icon: 'h-2.5 w-2.5',
    label: 'text-xs',
  },
  md: {
    box: 'h-4 w-4',
    icon: 'h-3 w-3',
    label: 'text-sm',
  },
  lg: {
    box: 'h-5 w-5',
    icon: 'h-3.5 w-3.5',
    label: 'text-base',
  },
};
