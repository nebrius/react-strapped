// Tell React that this is not a server component, since it's likely to be used
// as the first client-side-only component in a tree
'use client';

import type { PropsWithChildren } from 'react';
import React, { useContext } from 'react';
import type { RecoilState } from 'recoil';
import {
  useGotoRecoilSnapshot,
  useRecoilSnapshot,
  useRecoilStateLoadable,
} from 'recoil';

import { BootstrapRootsInScopeContext } from './util';

interface LocalizedStateProps<BootstrapData> {
  bootstrapData: BootstrapData;
  rootAtom: RecoilState<BootstrapData>;
}

export function BootstrapRoot<BootstrapData>({
  children,
  bootstrapData,
  rootAtom,
}: PropsWithChildren<LocalizedStateProps<BootstrapData>>) {
  // We get the loadable version of the root atom to check if it's in a loadable
  // state or not. Being in a loadable state tells us that the root atom has not
  // been initialized with bootstrap data yet, and that we should do so now.
  const [bootstrapDataLoadable] = useRecoilStateLoadable(rootAtom);

  // We get the list of known root atoms above this one. If any exist, then that
  // means this root is nested inside of another root. We need to pass along
  // the list of all roots to the nested context so that value hooks can check
  // if they are being called in the right component tree
  const parentBootstrapRoots = useContext(BootstrapRootsInScopeContext);

  // We use snapshots to set the root atom value instead of the typical
  // `useRecoilState` setter because the latter is asynchronous and would result
  // in bootstrap data not being available for the first render.
  const snapshot = useRecoilSnapshot();
  const gotoRecoilSnapshot = useGotoRecoilSnapshot();
  if (bootstrapDataLoadable.state === 'loading') {
    gotoRecoilSnapshot(
      snapshot.map(({ set }) => {
        set(rootAtom, bootstrapData);
      }),
    );
  }

  // TODO: add some logic that puts the root atom back in a loadable state on
  // component unmount here.

  return (
    <BootstrapRootsInScopeContext.Provider
      // We add this bootstrap root's root atom to the list of known roots.
      // Turns out, we can nest the same provider multiple times, and it scopes
      // itself so that we always get the right value in the right place.
      value={[...parentBootstrapRoots, rootAtom]}
    >
      {children}
    </BootstrapRootsInScopeContext.Provider>
  );
}
