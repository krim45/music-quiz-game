'use client';

import { toast } from '@/lib/store/useToastStore';
import { isAcceptedAnswer } from '@/utils/answer';
import TagInput, { type TagInputProps } from '@/components/form/input/TagInput';

interface Props extends Omit<TagInputProps, 'validate' | 'onReject'> {
  /** 이 곡의 제목. 제목은 이미 정답이므로 추가 정답으로 받지 않는다 */
  title: string;
}

/**
 * 곡의 추가 정답 입력.
 *
 * 채점은 띄어쓰기·대소문자·특수문자를 무시하고, 괄호 부분을 뺀 제목도 인정한다.
 * 그 기준으로 이미 정답인 값은 넣어도 의미가 없으므로 받지 않고 이유를 알려준다.
 * ("미쳐 (Crazy)"가 제목이면 "미쳐"는 이미 정답이고, "Crazy"는 넣어야 정답이 된다)
 */
export default function ExtraAnswersInput({ title, ...rest }: Props) {
  const validate = (tag: string, tags: string[]) => {
    if (title && isAcceptedAnswer(tag, [title])) return `"${tag}"은(는) 제목만으로 이미 정답이라 넣지 않아도 됩니다.`;
    if (isAcceptedAnswer(tag, tags)) return `"${tag}"은(는) 이미 있습니다.`;
    return null;
  };

  return <TagInput {...rest} validate={validate} onReject={(reason) => toast.info(reason)} />;
}
