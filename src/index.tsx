// Tell React that this is not a server component, since it's likely to be used
// as the first client-side-only component in a tree
'use client';

import React, {
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  createContext,
} from 'react';
import {
  type AtomOptions,
  type RecoilState,
  useRecoilValue,
  useRecoilCallback,
  atom,
} from 'recoil';

let nextProviderId = 0;

type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

// This context maintains all information about a given bootstrap root, and is
// mostly used to verify that things are being used in the correct place
const BootstrapRootContext = createContext<{
  id: number;
  parentIds: number[];
}>({
  // This default data indicates that this is outside of a bootstrap root
  // context, although currently it's just used to simplify TypeScript typing
  // and isn't used in practice
  id: NaN,
  parentIds: [],
});

class BootstrapRoot<BootstrapData> {
  #providerId = nextProviderId++;

  #attachedAtoms: Array<{
    bootstrappedAtom: RecoilState<unknown>;
    initialValue: (bootstrapData: BootstrapData) => unknown;
  }> = [];

  public constructor() {
    // Each of these functions is generic, and TypeScript currently doesn't
    // support generics on class fields with an arrow function, so we have to
    // bind their `this` values the old-fashioned way.
    this.bootstrappedAtom = this.bootstrappedAtom.bind(this);
    this.bootstrappedValueHook = this.bootstrappedValueHook.bind(this);
  }

  /**
   * Creates a bootstrapped atom for accessing bootstrap data.
   *
   * @param options Options here are the mostly the same as the options passed
   *  to the built-in `atom()` function in Recoil. The difference is that the
   *  `default` property is _not_ allowed, and there is a new `initialValue`
   *  function to replace `default`.
   * @param options.initialValue A function to initialize the bootstrapped atom
   *  with. This function is called at runtime with all of the bootstrap data
   *  passed to BootstrapRoot. The atom's value is then set to the value
   *  returned from this function.
   * @returns The bootstrapped atom that can then be passed to
   *  bootstrappedAtomValueHook to create a hook for safely accessing this data.
   *  The returned atom is a normal off-the-shelf Recoil atom, and can be used
   *  accordingly.
   */
  public bootstrappedAtom<AtomValue>({
    initialValue,
    ...options
  }: BootstrappedAtomOptions<AtomValue, BootstrapData>): [
    RecoilState<AtomValue>,
    () => AtomValue,
  ] {
    // Extra checking for vanilla JS users. This isn't possible in TypeScript
    if ('default' in options) {
      throw new Error(
        'The "default" prop is not allowed in bootstrapped atoms. Use "initialValue" instead',
      );
    }
    const bootstrappedAtom = atom(options);
    this.#attachedAtoms.push({
      bootstrappedAtom: bootstrappedAtom as RecoilState<unknown>,
      initialValue,
    });

    const useBootstrappedAtomValue = () => {
      // Check if this bootstrapped atom's root atom is in scope.
      const bootstrapRootContext = useContext(BootstrapRootContext);
      if (!bootstrapRootContext.parentIds.includes(this.#providerId)) {
        throw new Error(
          'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
        );
      }
      return useRecoilValue(bootstrappedAtom);
    };

    return [bootstrappedAtom, useBootstrappedAtomValue];
  }

  public bootstrappedValueHook<AtomValue>(
    options: BootstrappedAtomOptions<AtomValue, BootstrapData>,
  ) {
    return this.bootstrappedAtom(options)[1];
  }

  public Provider = ({
    children,
    bootstrapData,
  }: PropsWithChildren<{
    bootstrapData: BootstrapData;
  }>) => {
    // We use snapshots to set bootstrapped atom values instead of the typical
    // `useRecoilState` setter because the latter is asynchronous and would
    // result in bootstrap data not being available for the first render.
    const setBootstrapData = useRecoilCallback(
      ({ snapshot, gotoSnapshot }) =>
        () => {
          gotoSnapshot(
            snapshot.map(({ set }) => {
              for (const { bootstrappedAtom, initialValue } of this
                .#attachedAtoms) {
                set(bootstrappedAtom, initialValue(bootstrapData));
              }
            }),
          );
        },
      [],
    );

    const resetBootstrapData = useRecoilCallback(
      ({ reset }) =>
        () => {
          for (const { bootstrappedAtom } of this.#attachedAtoms) {
            reset(bootstrappedAtom);
          }
        },
      [],
    );

    const loadedRef = useRef(false);
    if (!loadedRef.current) {
      setBootstrapData();
    }

    const cleanup = useRef(() => {
      // Do nothing since we set this on the next line
    });
    cleanup.current = resetBootstrapData;
    useEffect(
      () => () => {
        cleanup.current();
        loadedRef.current = false;
      },
      [cleanup],
    );

    // We get the list of known root atoms above this one. If any exist, then that
    // means this root is nested inside of another root. We need to pass along
    // the list of all roots to the nested context so that value hooks can check
    // if they are being called in the right component tree
    const parentBootstrapRoot = useContext(BootstrapRootContext);
    return (
      <BootstrapRootContext.Provider
        // We add this bootstrap root's root atom to the list of known roots.
        // Turns out, we can nest the same provider multiple times, and it scopes
        // itself so that we always get the right value in the right place.
        value={{
          id: this.#providerId,
          parentIds: [...parentBootstrapRoot.parentIds, this.#providerId],
        }}
      >
        {children}
      </BootstrapRootContext.Provider>
    );
  };
}

export function createBootstrapRoot<BootstrapData = never>() {
  return new BootstrapRoot<BootstrapData>();
}
