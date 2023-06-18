'use client';

import React from 'react';
import { RecoilRoot } from 'recoil';

import type { MyBootstrapData } from './state';
import { myBootstrapRootAtom, useCurrentUser } from './state';
import { BootstrapRoot } from '../..';

function MyComponent() {
  const currentUser = useCurrentUser();
  return (
    // Prints "Hello Philip J Fry"
    <div>Hello {currentUser.name}</div>
  );
}

export function MyApp({ bootstrapData }: { bootstrapData: MyBootstrapData }) {
  return (
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={bootstrapData}
        bootstrapRootAtom={myBootstrapRootAtom}
      >
        <MyComponent />
      </BootstrapRoot>
    </RecoilRoot>
  );
}
