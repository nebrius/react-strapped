// Tell React that this is not a server component, since it's likely to be used
// as the first client-side-only component in a tree
'use client';

import React, { useContext, useEffect, useRef } from 'react';
import { useRecoilCallback } from 'recoil';

import {
  type BootstrapRoot,
  type BootstrappedRecoilAtom,
  type ProviderProps,
  initialValueSymbol,
  attachedAtomsSymbol,
  BootstrapRootContext,
  bootstrappedAtomIdSymbol,
} from './util';

let nextProviderId = 0;

export function createBootstrapRoot<
  BootstrapData = never,
>(): BootstrapRoot<BootstrapData> {
  const providerId = nextProviderId++;
  const attachedAtoms: Array<BootstrappedRecoilAtom<unknown, BootstrapData>> =
    [];

  function Provider({ children, bootstrapData }: ProviderProps<BootstrapData>) {
    // We use snapshots to set bootstrapped atom values instead of the typical
    // `useRecoilState` setter because the latter is asynchronous and would
    // result in bootstrap data not being available for the first render.
    const setBootstrapData = useRecoilCallback(
      ({ snapshot, gotoSnapshot }) =>
        () => {
          gotoSnapshot(
            snapshot.map(({ set }) => {
              for (const attachedAtom of attachedAtoms) {
                set(
                  attachedAtom,
                  attachedAtom[initialValueSymbol](bootstrapData),
                );
              }
            }),
          );
        },
      [],
    );

    const resetBootstrapData = useRecoilCallback(
      ({ reset }) =>
        () => {
          for (const attachedAtom of attachedAtoms) {
            reset(attachedAtom);
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
          id: providerId,
          parentIds: [...parentBootstrapRoot.parentIds, providerId],
          attachedAtomIds: [
            ...parentBootstrapRoot.attachedAtomIds,
            ...attachedAtoms.map((atom) => atom[bootstrappedAtomIdSymbol]),
          ],
        }}
      >
        {children}
      </BootstrapRootContext.Provider>
    );
  }

  return {
    Provider,
    [attachedAtomsSymbol]: attachedAtoms,
  };
}
