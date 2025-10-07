export type Player = {
  id: string; // socket.id
  nickname: string; // 사용자 닉네임
  color: string; // 고유 색상 (랜덤)
  score: number; // 정답 맞춘 횟수
};

export type Room = {
  password?: string;
  players: Map<string, Player>;
};

export type RoomCreatePayload = {
  password?: string;
};

export type RoomJoinPayload = {
  roomId: string;
  password?: string;
  nickname: string;
};
