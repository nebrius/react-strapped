import type { RecoilValue } from 'recoil';
import { useRecoilValueLoadable } from 'recoil';

export function bootstrappedAtomValueHook<T>(bootstrappedAtom: RecoilValue<T>) {
  // Since bootstrap roots are initialized synchronously, any bootstrapped atom
  // that is referenced via this hook in a descendent of the bootstrap root is
  // always guaranteed to have a value. This allows us to query the loaded state
  // of an atom to determine whether or not this hook was called in a descendent
  // of the bootstrap root or not, and throw a human readable error if not.
  return () => {
    const valueLoadable = useRecoilValueLoadable(bootstrappedAtom);
    switch (valueLoadable.state) {
      case 'hasValue': {
        return valueLoadable.contents;
      }
      case 'loading': {
        throw new Error(
          'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
        );
      }
      case 'hasError': {
        // This will never happen due to recoil-bootstrap itself, but I suspect
        // it might be possible to get this into an error effect using an atom
        // effect. I'd argue this is an anti-pattern, but we want to have a sane
        // response in case someone wants to do so regardless.
        throw valueLoadable.contents;
      }
    }
  };
}
