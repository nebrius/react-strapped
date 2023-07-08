import { createContext } from 'react';
import type { RecoilState, RecoilValue } from 'recoil';

// This symbol is added to bootstrapped atoms as a hidden top level property
// (see BootstrappedRecoilAtom below). We use this property in value hooks to
// ensure that the BootstrappedRecoilAtom instance is only accessed inside of
// it's corresponding bootstrap root, as signified by this root atom.
export const rootAtomSymbol = Symbol('rootAtom');

export type BootstrappedRecoilAtom<AtomValue, BootstrapData> =
  RecoilState<AtomValue> & {
    [rootAtomSymbol]: RecoilValue<BootstrapData>;
  };

// This context maintains the bootstrap roots in scope for a given component
// tree, and is what value hooks use to determine if rootAtomSymbol on an atom
// can be accessed correctly.
export const BootstrapRootsInScopeContext = createContext<
  Array<RecoilValue<unknown>>
>([]);
