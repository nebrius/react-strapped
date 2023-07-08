import { type AtomOptions } from 'recoil';
import { atom } from 'recoil';

import {
  type BootstrapRoot,
  type BootstrappedRecoilAtom,
  bootstrappedAtomIdSymbol,
  attachedAtomsSymbol,
  initialValueSymbol,
} from './util';

type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

let nextBootstrappedAtomId = 0;

/**
 * Creates a bootstrapped atom for accessing bootstrap data.
 *
 * @param bootstrapRoot The bootstrap root associated with this atom that will
 *  supply this atom with bootstrap data on initialization.
 * @param options Options here are the mostly the same as the options passed to
 *  the built-in `atom()` function in Recoil. The difference is that the
 *  `default` property is _not_ allowed, and there is a new `initialValue`
 *  function to replace `default`.
 * @param options.initialValue A function to initialize the bootstrapped atom
 *  with. This function is called at runtime with all of the bootstrap data
 *  passed to BootstrapRoot. The atom's value is then set to the value returned
 *  from this function.
 * @returns The bootstrapped atom that can then be passed to
 *  bootstrappedAtomValueHook to create a hook for safely accessing this data.
 *  The returned atom is a normal off-the-shelf Recoil atom, and can be used
 *  accordingly.
 */
export function bootstrappedAtom<AtomValue, BootstrapData>(
  bootstrapRoot: BootstrapRoot<BootstrapData>,
  {
    initialValue,
    ...options
  }: BootstrappedAtomOptions<AtomValue, BootstrapData>,
) {
  // Extra checking for vanilla JS users. This isn't possible in TypeScript
  if ('default' in options) {
    throw new Error(
      'The "default" prop is not allowed in bootstrapped selectors. Use "initialValue" instead',
    );
  }

  // We have to do an `as` cast here because the initialValueSymbol property is
  // currently missing. Technically this is a gap in typing (which I call a
  // "type hole"), but we set it correctly in the next line anyways so it's only
  // temporary missing.
  const newAtom = atom(options) as BootstrappedRecoilAtom<
    AtomValue,
    BootstrapData
  >;

  // We attach the initialValue function to the atom so we can later invoke it.
  // We store this using a symbol so that it doesn't leak into the public API.
  newAtom[initialValueSymbol] = initialValue;

  // We attach the bootstrap atom ID so we can check it against known atoms when
  // referencing them in value hooks to make sure we're accessing them in the
  // correct root.
  newAtom[bootstrappedAtomIdSymbol] = nextBootstrappedAtomId++;

  // Add this atom to the bootstrap root's list of atoms so it can be properly
  // initialized once the bootstrap root is rendered.
  bootstrapRoot[attachedAtomsSymbol].push(newAtom);

  return newAtom;
}
