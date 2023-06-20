import { atom } from 'recoil';

export function rootAtom<T>(key: string) {
  return atom<T>({ key });
}
