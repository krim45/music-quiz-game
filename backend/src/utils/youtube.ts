// TODO: 프론트에도 똑같이 있는 코드인데, 공통화할 방법?
// packages/shared로 가는 거야.
// (배포는 백/프론트 따로여도, 빌드할 때 shared가 같이 설치되면 문제 없음)
export const extractVideoId = (url: string) => {
  try {
    // 1) youtu.be 간단 링크
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }

    // 2) watch?v= 형식
    const urlObj = new URL(url);
    const v = urlObj.searchParams.get('v');
    if (v) return v;

    // 3) shorts
    if (url.includes('/shorts/')) {
      return url.split('/shorts/')[1].split('?')[0];
    }

    return null;
  } catch {
    return null;
  }
};
