import Modal from '@/components/overlay/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ open, onClose }: Props) => {
  return (
    <Modal open={open} onClose={onClose} title='게임 방법' width={375} height={300}>
      <div>
        들려오는 노래를 듣고, <br />
        채팅으로 노래 제목을 맞히면 됩니다. <br />
        <br />
        정답 입력 시, <br />
        띄어쓰기, 대소문자는 구분 없이 인정됩니다. <br />
        <br />
        {'ex) 토미오카 아이 - Good bye bye'} <br />
        {'-> goodbyebye, 굿바이바이 (O)'}
      </div>
    </Modal>
  );
};

export default HowToPlayModal;
