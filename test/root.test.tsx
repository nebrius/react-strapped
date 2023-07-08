import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import type { Loadable } from 'recoil';
import { RecoilRoot, useRecoilValueLoadable } from 'recoil';

import { getUniqueTestKey } from './util';
import { BootstrapRoot, rootAtom } from '../src';

interface TestBootstrapData {
  user: {
    name: string;
    age: number;
  };
}

const TEST_BOOTSTRAP_DATA: TestBootstrapData = {
  user: {
    name: 'Philip J. Fry',
    age: 1026,
  },
};

test('Initializes root atoms synchronously', () => {
  const testRootAtom = rootAtom(getUniqueTestKey());
  let rootLoadableState: Loadable<TestBootstrapData>['state'] | undefined;

  function TestApp() {
    const loadable = useRecoilValueLoadable(testRootAtom);
    rootLoadableState = loadable.state;
    return null;
  }

  render(
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={TEST_BOOTSTRAP_DATA}
        rootAtom={testRootAtom}
      >
        <TestApp />
      </BootstrapRoot>
    </RecoilRoot>,
  );

  expect(rootLoadableState).toEqual('hasValue');
});

// TODO: this test throws a Recoil warning that may or may not be safe to
// ignore. See https://github.com/facebookexperimental/Recoil/issues/12
test("Doesn't initialize root atoms until after bootstrap root is rendered", async () => {
  const testRootAtom = rootAtom(getUniqueTestKey());
  let rootLoadableState: Loadable<TestBootstrapData>['state'] | undefined;

  function TestApp() {
    const [shouldRender, setShouldRender] = useState(false);
    const loadable = useRecoilValueLoadable(testRootAtom);
    rootLoadableState = loadable.state;

    let contents: JSX.Element | null;
    if (shouldRender) {
      contents = (
        <BootstrapRoot
          bootstrapData={TEST_BOOTSTRAP_DATA}
          rootAtom={testRootAtom}
        />
      );
    } else {
      contents = null;
    }

    return (
      <>
        <button onClick={() => setShouldRender(true)}>Load Recoil</button>
        {contents}
      </>
    );
  }

  render(
    <RecoilRoot>
      <TestApp />
    </RecoilRoot>,
  );

  expect(rootLoadableState).toEqual('loading');

  await userEvent.click(screen.getByText('Load Recoil'));
  expect(rootLoadableState).toEqual('hasValue');
});
