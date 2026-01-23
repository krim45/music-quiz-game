'use client';

import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/element/Label';
import Radio from '@/components/form/radio/Radio';
import RadioGroup from '@/components/form/radio/RadioGroup';
import type { RoomInfo } from '@/app/room/create/_types';

interface Props {
  roomInfo: RoomInfo;
  onChange: (patch: Partial<RoomInfo>) => void;
}

export default function RoomSettingSection({ roomInfo, onChange }: Props) {
  return (
    <div className='flex w-full flex-col gap-5'>
      <InputField
        label='제목'
        charLimit={30}
        helperText='방 제목을 입력하세요'
        onChange={(title) => onChange({ title })}
        value={roomInfo.title}
        required
      />

      <div className='flex flex-col gap-3'>
        <Label label='공개 설정' required />

        <RadioGroup value={roomInfo.isPublic!} onChange={(isPublic) => onChange({ isPublic })}>
          <Radio value={true} label='공개' />
          <Radio value={false} label='비공개' />
        </RadioGroup>
      </div>

      {!roomInfo.isPublic && (
        <InputField
          required
          label='비밀번호'
          placeholder='비밀번호'
          type='password'
          value={roomInfo.password}
          onChange={(password) => onChange({ password })}
        />
      )}
    </div>
  );
}
