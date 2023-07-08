import type { AtomOptions, RecoilValue } from 'recoil';
import { atom, selector } from 'recoil';

import type { BootstrappedRecoilAtom } from './util';
import { rootAtomSymbol } from './util';

type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

// Bootstrapped atoms are initialized by creating a special hidden selector that
// we assign to the `default` prop in our atom we create. This selector is tied
// to the root atom, causing this atom's loadable state to match that of the
// root atom.
/**
 * Creates a bootstrapped atom for accessing bootstrap data.
 *
 * @param rootAtom The root atom containing the bootstrap data to initialize
 *  this atom with.
 * @param options Options here are the mostly the same as the options passed to
 *  the built-in `atom()` function in Recoil. The difference is that the
 *  `default` property is _not_ allowed, and there is a new `initialValue`
 *  function to replace `default`.
 * @param options.initialValue A function to initialize the bootstrapped atom
 *  with. This function is called at runtime with all of the bootstrap data
 *  passed to BoostrapRoot. The atom's value is then set to the value returned
 *  from this function.
 * @returns The bootstrapped atom that can then be passed to
 *  bootstrappedAtomValueHook to create a hook for safely accessing this data.
 *  The returned atom is a normal off-the-shelf Recoil atom, and can be used
 *  accordingly.
 */
export function bootstrappedAtom<AtomValue, BootstrapData>(
  rootAtom: RecoilValue<BootstrapData>,
  {
    initialValue,
    // We pull the key out so we can compute a derived key name for the selector
    key,
    ...options
  }: BootstrappedAtomOptions<AtomValue, BootstrapData>,
) {
  // Extra checking for vanilla JS users. This isn't possible in TypeScript
  if ('default' in options) {
    throw new Error(
      'The "default" prop is not allowed in bootstrapped atoms. Use "initialValue" instead',
    );
  }
  const newAtom = atom({
    ...options,
    key,
    // We set the default to a selector so that we can grab the bootstrap data
    // from its root atom, which is initialized in a <BootstrapRoot> component
    default: selector({
      key: `${key}:atomInitializer`,
      // TODO: do we need to guard against the first-run case when the rootAtom
      // is created but in a loadable state?
      get: ({ get }) => initialValue(get(rootAtom)),
    }),
    // We have to do an `as` cast here because the rootAtomSymbol property is
    // currently missing. Technically this is a gap in typing (which I call a
    // "type hole"), but we set it correctly in the next line anyways.
  }) as BootstrappedRecoilAtom<AtomValue, BootstrapData>;

  newAtom[rootAtomSymbol] = rootAtom;

  return newAtom;
}
