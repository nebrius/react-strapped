// Tell React that this is not a server component, since it's likely to be used
// as the first client-side component in a tree
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
  const snapshot = useRecoilSnapshot();
  const gotoRecoilSnapshot = useGotoRecoilSnapshot();
  const [bootstrapDataLoadable] = useRecoilStateLoadable(rootAtom);
  if (bootstrapDataLoadable.state === 'loading') {
    const loadedSnapshot = snapshot.map(({ set }) => {
      set(rootAtom, bootstrapData);
    });
    gotoRecoilSnapshot(loadedSnapshot);
  }
  return <>{children}</>;
}
