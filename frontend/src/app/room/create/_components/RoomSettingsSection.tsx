'use client';

import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/element/Label';
import Radio from '@/components/form/radio/Radio';
import RadioGroup from '@/components/form/radio/RadioGroup';
import type { RoomInfo } from '@/app/room/create/_types';

interface Props {
  roomInfo: RoomInfo;
  onChange: (key: keyof RoomInfo, value: RoomInfo[keyof RoomInfo]) => void;
}

export default function RoomSettingsSection({ roomInfo, onChange }: Props) {
  return (
    <div className='flex w-full flex-col gap-5'>
      <InputField
        label='제목'
        charLimit={30}
        helperText='게임 제목을 입력하세요'
        onChange={(v) => onChange('title', v)}
        value={roomInfo.title}
        required
      />

      <div className='flex flex-col gap-3'>
        <Label label='공개 설정' required />

        <RadioGroup value={roomInfo.isPublic!} onChange={(v) => onChange('isPublic', v)}>
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
          onChange={(v) => onChange('password', v)}
        />
      )}
    </div>
  );
}
