import { atom } from 'recoil';

export function bootstrapRootAtom<T>(key: string) {
  return atom<T>({ key });
}
