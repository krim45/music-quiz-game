'use client';

import { toast } from '@/lib/store/useToastStore';
import TagInput, { type TagInputProps } from '@/components/form/input/TagInput';

/** 정답 비교 기준. 백엔드 normalizeAnswer와 같아야 한다 — 공백·대소문자 무시 */
const normalizeAnswer = (s: string) => s.replace(/\s+/g, '').trim().toLowerCase();

interface Props extends Omit<TagInputProps, 'validate' | 'onReject'> {
  /** 이 곡의 제목. 제목은 이미 정답이므로 추가 정답으로 받지 않는다 */
  title: string;
}

/**
 * 곡의 추가 정답 입력.
 *
 * 채점은 공백·대소문자를 무시하므로, 그 기준으로 같은 값은 넣어도 의미가 없다.
 * 제목과 같거나 이미 있는 정답은 받지 않고 이유를 알려준다.
 */
export default function ExtraAnswersInput({ title, ...rest }: Props) {
  const validate = (tag: string, tags: string[]) => {
    const key = normalizeAnswer(tag);

    if (title && key === normalizeAnswer(title)) return `"${tag}"은(는) 제목과 같아 넣지 않아도 됩니다.`;
    if (tags.some((t) => normalizeAnswer(t) === key)) return `"${tag}"은(는) 이미 있습니다.`;
    return null;
  };

  return <TagInput {...rest} validate={validate} onReject={(reason) => toast.info(reason)} />;
}
