import React from 'react';
import {BootstrapRoot} from '../..';
import { myBootstrapRootAtom, useCurrentUser } from './state';
import { RecoilRoot } from 'recoil';

function MyComponent() {
  const currentUser = useCurrentUser()
  return (
    // Prints "Hello Philip J Fry"
    <div>Hello {currentUser.name}</div>
  )
}

export function MyApp() {
  return (
    <RecoilRoot>
      <BootstrapRoot bootstrapData={{
        currentUser: {
          name: 'Philip J Fry',
          age: 1_026
        }
      }} bootstrapRootAtom={myBootstrapRootAtom}>
        <MyComponent />
      </BootstrapRoot>
    </RecoilRoot>
  );
}