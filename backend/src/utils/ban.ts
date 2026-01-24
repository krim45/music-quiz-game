import crypto from 'crypto';
import { getClientIp } from '@/utils/game';

import type { Socket } from 'socket.io';
import type { BanEntry, Room } from '@/types';

export function getUserAgent(socket: Socket): string {
  const ua = socket.handshake.headers['user-agent'];
  return typeof ua === 'string' ? ua : '';
}

export function hashUA(ua: string): string {
  return crypto.createHash('sha256').update(ua).digest('hex').slice(0, 16);
}

function isIPv4(ip: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
}

function isIPv6(ip: string) {
  return ip.includes(':');
}

/**
 * IPv4: /24 단위로 묶기 (203.0.113.xxx -> 203.0.113.0/24)
 * IPv6: /64 단위로 묶기 (앞 4헥텟)
 */
export function toIpPrefix(ip: string): string {
  if (isIPv4(ip)) {
    const [a, b, c] = ip.split('.');
    return `${a}.${b}.${c}.0/24`;
  }

  if (isIPv6(ip)) {
    const parts = ip.split(':').filter(Boolean);
    const p = parts.slice(0, 4).join(':');
    return `${p}::/64`;
  }

  return `${ip}/full`;
}

export function getSid(socket: Socket): string | null {
  const sid = socket.data.sid;
  return typeof sid === 'string' && sid.length > 0 ? sid : null;
}

export function ensureBans(room: Room) {
  if (!room.bans) room.bans = new Map();
}

export function cleanupExpiredBans(room: Room) {
  if (!room.bans) return;
  const now = Date.now();
  for (const [key, entry] of room.bans.entries()) {
    if (entry.expiresAt <= now) room.bans.delete(key);
  }
}

export function isBanned(room: Room, sid: string, ipPrefix: string, uaHash: string): boolean {
  if (!room.bans) return false;

  cleanupExpiredBans(room);

  // 1) sid 직접 매치
  const direct = room.bans.get(sid);
  if (direct) return true;

  // 2) 보조 지문 매치 (ipPrefix + uaHash)
  for (const entry of room.bans.values()) {
    if (entry.ipPrefix === ipPrefix && entry.uaHash === uaHash) return true;
  }

  return false;
}

/**
 * 밴 등록: key는 sid로 넣고, entry에 보조 지문도 저장
 */
export function addBan(room: Room, entry: BanEntry) {
  ensureBans(room);
  room.bans!.set(entry.sid, entry);
}

/**
 * 소켓 기준으로 BanEntry 생성
 */
export function makeBanEntry(socket: Socket, ttlMs: number): BanEntry | null {
  const sid = getSid(socket);
  if (!sid) return null;

  const ip = getClientIp(socket);
  if (!ip) return null;

  const ua = getUserAgent(socket);
  const uaHash = hashUA(ua);
  const ipPrefix = toIpPrefix(ip);

  const now = Date.now();
  return {
    sid,
    ipPrefix,
    uaHash,
    bannedAt: now,
    expiresAt: now + ttlMs,
  };
}
