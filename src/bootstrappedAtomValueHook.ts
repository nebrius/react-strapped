import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import type { BootstrappedRecoilAtom } from './util';
import { BootstrapRootsInScopeContext, rootAtomSymbol } from './util';

export function bootstrappedAtomValueHook<AtomValue, BootstrapData>(
  bootstrappedAtom: BootstrappedRecoilAtom<AtomValue, BootstrapData>,
) {
  return () => {
    // Check if this bootstrapped atom's root atom is in scope. See comments for
    // the implementation of rootAtomSymbol and BootstrapRootsInScopeContext for
    // more details on how this works.
    const parentBootstrapRoots = useContext(BootstrapRootsInScopeContext);
    if (!parentBootstrapRoots.includes(bootstrappedAtom[rootAtomSymbol])) {
      throw new Error(
        'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
      );
    }
    return useRecoilValue(bootstrappedAtom);
  };
}
