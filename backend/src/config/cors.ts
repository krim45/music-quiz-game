/**
 * - 쿠키(credential) 기반이므로 `*` 허용 불가
 * - 로컬/배포에서 허용할 Origin들을 쉼표로 관리
 */
export const ALLOWED_ORIGINS: string[] = process.env
  .CORS_ORIGINS!.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;

  return ALLOWED_ORIGINS.includes(origin);
}
