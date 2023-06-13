import type { RecoilValue } from 'recoil';
import { useRecoilValueLoadable } from 'recoil';

export function bootstrappedAtomValueHook<T>(bootstrappedAtom: RecoilValue<T>) {
  return () => {
    const valueLoadable = useRecoilValueLoadable(bootstrappedAtom);
    switch (valueLoadable.state) {
      case 'hasValue': {
        return valueLoadable.contents;
      }
      case 'loading': {
        throw new Error(
          'Bootstrap root atom not loaded. Did you call this hook outside of its bootstrap root component tree?',
        );
      }
      case 'hasError': {
        throw valueLoadable.contents;
      }
    }
  };
}
