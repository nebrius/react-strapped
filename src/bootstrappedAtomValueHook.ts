import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import {
  type BootstrappedRecoilAtom,
  bootstrappedAtomIdSymbol,
  BootstrapRootContext,
} from './util';

/**
 * Creates a hook for accessing a bootstrapped atom's value safely.
 *
 * @param bootstrappedAtom - The bootstrapped atom to create the accessor hook for
 * @returns The hook that accesses the value.
 */
export function bootstrappedAtomValueHook<AtomValue, BootstrapData>(
  bootstrappedAtom: BootstrappedRecoilAtom<AtomValue, BootstrapData>,
) {
  return () => {
    // Check if this bootstrapped atom's root atom is in scope. See comments for
    // the implementation of rootAtomSymbol and BootstrapRootsInScopeContext for
    // more details on how this works.
    const bootstrapRootContext = useContext(BootstrapRootContext);
    if (
      !bootstrapRootContext.attachedAtomIds.includes(
        bootstrappedAtom[bootstrappedAtomIdSymbol],
      )
    ) {
      throw new Error(
        'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
      );
    }
    return useRecoilValue(bootstrappedAtom);
  };
}
