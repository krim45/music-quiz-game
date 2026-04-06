import { useEffect, useRef, useState } from 'react';
import { isTypingElement } from '@/utils/reactUtils';

import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';
import Send from '@/components/icon/Send';

type Props = {
  actions: React.ReactNode;
  onSendMessage?: (message: string) => void;
};

export default function ChatInput({ actions, onSendMessage }: Props) {
  const [input, setInput] = useState('');
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onEnterFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (e.isComposing) return;
      if (isTypingElement(document.activeElement)) return;

      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', onEnterFocus);
    return () => {
      window.removeEventListener('keydown', onEnterFocus);
    };
  }, []);

  const sendMessage = () => {
    const message = input.trim();
    if (!message) return;

    onSendMessage?.(message);
    setInput('');
  };

  return (
    <form
      className='flex flex-none items-center gap-2 border-t border-green-900 p-2'
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
    >
      <BaseInput
        ref={inputRef}
        className='flex-1 rounded border border-green-900 p-1 text-base focus:border-green-600'
        value={input}
        onChange={(v) => setInput(v)}
        placeholder='정답을 입력하세요'
      />

      <div className='flex items-center gap-2'>
        {actions}

        <Button className='!px-2' type='submit' size='sm' color='green'>
          <Send />
        </Button>
      </div>
    </form>
  );
}
