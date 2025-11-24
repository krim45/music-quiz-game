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
