'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import type { RecoilState } from 'recoil';
import { useRecoilStateLoadable } from 'recoil';

interface LocalizedStateProps<BootstrapData> {
  bootstrapData: BootstrapData;
  bootstrapRootAtom: RecoilState<BootstrapData>;
}

export function BootstrapRoot<BootstrapData>({
  children,
  bootstrapData,
  bootstrapRootAtom,
}: PropsWithChildren<LocalizedStateProps<BootstrapData>>) {
  const [bootstrapDataLoadable, setBootstrapData] =
    useRecoilStateLoadable(bootstrapRootAtom);
  // We only want to initialize once, even if bootstrap data changes (this is a bug if it happens)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setBootstrapData(bootstrapData), []);
  switch (bootstrapDataLoadable.state) {
    case 'loading': {
      return null;
    }
    case 'hasError': {
      throw bootstrapDataLoadable.contents;
    }
    case 'hasValue': {
      return <>{children}</>;
    }
  }
}
