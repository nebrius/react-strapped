'use client';

import type { AtomOptions, Loadable, RecoilValue, WrappedValue } from 'recoil';
import { atom, selector } from 'recoil';

type BootstrappedAtomOptions<AtomValue, InitialState> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (
    initialState: InitialState,
  ) =>
    | RecoilValue<AtomValue>
    | Promise<AtomValue>
    | Loadable<AtomValue>
    | WrappedValue<AtomValue>
    | AtomValue;
};

export function bootstrappedAtom<AtomValue, InitialState>(
  initialStateAtom: RecoilValue<InitialState>,
  {
    initialValue,
    key,
    ...options
  }: BootstrappedAtomOptions<AtomValue, InitialState>,
) {
  if ('default' in options) {
    throw new Error(
      'The "default" prop is not allowed in bootstrapped atoms. Use initialValue instead',
    );
  }
  return atom({
    ...options,
    key,
    // We set the default to a selector so that we can grab the initial value
    // from the initial value atom, which is set in a LayoutStateRoot component
    default: selector({
      key: `${key}:atomInitializer`,
      get: ({ get }) => initialValue(get(initialStateAtom)),
    }),
  });
}
