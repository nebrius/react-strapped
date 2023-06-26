// Tell React that this is not a server component, since it's likely to be used
// as the first client-side-only component in a tree
'use client';

import type { PropsWithChildren } from 'react';
import React from 'react';
import type { RecoilState } from 'recoil';
import {
  useGotoRecoilSnapshot,
  useRecoilSnapshot,
  useRecoilStateLoadable,
} from 'recoil';

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
  return <>{children}</>;
}
