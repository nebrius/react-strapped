import { type FunctionComponent, type PropsWithChildren } from 'react';
import { createContext } from 'react';
import { type RecoilState } from 'recoil';

// This symbol is added to bootstrapped atoms as a hidden top level property
// (see BootstrappedRecoilAtom below). We use this property in value hooks to
// ensure that the BootstrappedRecoilAtom instance is only accessed inside of
// it's corresponding bootstrap root, as signified by this root atom.
export const initialValueSymbol = Symbol('rootAtom');
export const bootstrappedAtomIdSymbol = Symbol('bootstrappedAtomId');

export type BootstrappedRecoilAtom<AtomValue, BootstrapData> =
  RecoilState<AtomValue> & {
    [initialValueSymbol]: (bootstrapData: BootstrapData) => AtomValue;
    [bootstrappedAtomIdSymbol]: number;
  };

export type ProviderProps<BootstrapData> = PropsWithChildren<{
  bootstrapData: BootstrapData;
}>;

export interface BootstrapRoot<BootstrapData> {
  Provider: FunctionComponent<ProviderProps<BootstrapData>>;
  // TODO: Using `unknown` doesn't work right now for reasons I don't fully
  // understand. They say "unknown is not assignable to SomeType", although
  // we shouldn't ever be assigning in that direction anyways.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attachedAtomsSymbol]: Array<BootstrappedRecoilAtom<any, BootstrapData>>;
}

// This context maintains the id for the current bootstrap root and the parent
// ids of its parent bootstrap roots (if any).
export const BootstrapRootContext = createContext<{
  id: number;
  parentIds: number[];
  attachedAtomIds: number[];
}>({
  // This default data indicates that this is outside of a bootstrap root context
  id: NaN,
  parentIds: [],
  attachedAtomIds: [],
});

export const attachedAtomsSymbol = Symbol('attachedAtoms');
