import Modal from '@/components/overlay/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ open, onClose }: Props) => {
  return (
    <Modal open={open} onClose={onClose} title='게임 방법' width={375} height={390}>
      <div>
        들려오는 노래를 듣고, <br />
        입력창에 노래 제목을 입력하고 제출하세요. <br />
        <br />
        정답 입력 시, <br />
        띄어쓰기, 대소문자는 구분 없이 인정됩니다. <br />
        <br />
        {'ex) Good bye bye'} <br />
        {'→ goodbyebye, 굿바이바이 (O)'} <br />
        <br />
        카운트다운 → 노래 재생 → 제목 입력/제출 → 정답 공개 → 다음 곡
      </div>
    </Modal>
  );
};

export default HowToPlayModal;
