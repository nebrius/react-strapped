// Tell React that this is not a server component, since it's likely to be used
// as the first client-side component in a tree
'use client';

import type { PropsWithChildren } from 'react';
import React, { useRef } from 'react';
import type { RecoilState } from 'recoil';
import { useRecoilSnapshot } from 'recoil';

interface LocalizedStateProps<BootstrapData> {
  bootstrapData: BootstrapData;
  rootAtom: RecoilState<BootstrapData>;
}

function RootInitializer<BootstrapData>({
  children,
  bootstrapData,
  rootAtom,
}: PropsWithChildren<LocalizedStateProps<BootstrapData>>) {
  const snapshot = useRecoilSnapshot();
  snapshot.map(({ set }) => {
    set(rootAtom, bootstrapData);
  });
  snapshot.retain();
  return <>{children}</>;
}

export function BootstrapRoot<BootstrapData>({
  children,
  bootstrapData,
  rootAtom,
}: PropsWithChildren<LocalizedStateProps<BootstrapData>>) {
  const isInitializedRef = useRef(false);
  if (!isInitializedRef.current) {
    isInitializedRef.current = true;
    return (
      <RootInitializer bootstrapData={bootstrapData} rootAtom={rootAtom}>
        {children}
      </RootInitializer>
    );
  } else {
    return <>{children}</>;
  }
}
