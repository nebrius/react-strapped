import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Suspense, useState } from 'react';
import type { Loadable } from 'recoil';
import { useRecoilValueLoadable, RecoilRoot } from 'recoil';

import { getUniqueTestKey } from './util';
import {
  BootstrapRoot,
  bootstrappedAtom,
  bootstrappedAtomValueHook,
  rootAtom,
} from '../src';

interface TestBootstrapData {
  user: {
    name: string;
    age: number;
  };
}

const TEST_BOOTSTRAP_DATA_1: TestBootstrapData = {
  user: {
    name: 'Philip J. Fry',
    age: 1026,
  },
};

const TEST_BOOTSTRAP_DATA_2: TestBootstrapData = {
  user: {
    name: 'Bender Bending Rodríguez',
    age: 4,
  },
};

test('Puts root atoms back into loading state after unmount', async () => {
  const testRootAtom = rootAtom(getUniqueTestKey());
  let rootLoadableState: Loadable<TestBootstrapData>['state'] | undefined;

  function TestApp() {
    const [shouldRender, setShouldRender] = useState(true);
    const loadable = useRecoilValueLoadable(testRootAtom);
    rootLoadableState = loadable.state;

    let contents: JSX.Element | null;
    if (shouldRender) {
      contents = (
        <BootstrapRoot
          bootstrapData={TEST_BOOTSTRAP_DATA_1}
          rootAtom={testRootAtom}
        />
      );
    } else {
      contents = null;
    }

    return (
      <>
        <button onClick={() => setShouldRender(false)}>Unload Recoil</button>
        {contents}
      </>
    );
  }

  render(
    <RecoilRoot>
      <TestApp />
    </RecoilRoot>,
  );

  expect(rootLoadableState).toEqual('hasValue');

  await userEvent.click(screen.getByText('Unload Recoil'));
  expect(rootLoadableState).toEqual('loading');
});

test('Resets default state on remount', async () => {
  const testRootAtom = rootAtom<TestBootstrapData>(getUniqueTestKey());
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: getUniqueTestKey(),
    initialValue: ({ user }) => user,
  });
  const useTestBootstrappedAtomValue =
    bootstrappedAtomValueHook(testBootstrappedAtom);

  let testBootstrappedAtomValue: TestBootstrapData['user'] | undefined;

  function Contents() {
    testBootstrappedAtomValue = useTestBootstrappedAtomValue();
    return null;
  }

  function TestApp() {
    const [key, setKey] = useState(0);

    return (
      <>
        <button onClick={() => setKey(1)}>Reset Recoil</button>
        <BootstrapRoot
          key={`test-${key}`}
          bootstrapData={key ? TEST_BOOTSTRAP_DATA_2 : TEST_BOOTSTRAP_DATA_1}
          rootAtom={testRootAtom}
        >
          <Contents />
        </BootstrapRoot>
      </>
    );
  }

  render(
    <Suspense fallback={<></>}>
      <RecoilRoot>
        <TestApp />
      </RecoilRoot>
    </Suspense>,
  );

  console.log('testing 1');
  expect(testBootstrappedAtomValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Reset Recoil'));
  console.log('testing 2');
  expect(testBootstrappedAtomValue).toEqual(TEST_BOOTSTRAP_DATA_2.user);
});
