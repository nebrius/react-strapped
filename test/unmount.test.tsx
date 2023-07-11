import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Suspense, useState } from 'react';
import { RecoilRoot } from 'recoil';

import { createStrappedProvider } from '../src/core';

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

test('Resets default state on remount', async () => {
  const TestStrappedProvider = createStrappedProvider<TestBootstrapData>();
  const useTestBootstrappedAtomValue =
    TestStrappedProvider.createBootstrappedValue(({ user }) => user);

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
        <TestStrappedProvider.Provider
          key={`test-${key}`}
          bootstrapData={key ? TEST_BOOTSTRAP_DATA_2 : TEST_BOOTSTRAP_DATA_1}
        >
          <Contents />
        </TestStrappedProvider.Provider>
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

  expect(testBootstrappedAtomValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Reset Recoil'));
  expect(testBootstrappedAtomValue).toEqual(TEST_BOOTSTRAP_DATA_2.user);
});

test('Unmounts with Recoil root cleanly', async () => {
  const TestStrappedProvider = createStrappedProvider<TestBootstrapData>();
  const useTestBootstrappedAtomValue =
    TestStrappedProvider.createBootstrappedValue(({ user }) => user);

  function Contents() {
    const testValue = useTestBootstrappedAtomValue();
    return <>{testValue.name}</>;
  }

  function TestApp() {
    const [shouldRender, setShouldRender] = useState(true);

    if (!shouldRender) {
      return null;
    }
    return (
      <RecoilRoot>
        <button onClick={() => setShouldRender(false)}>Reset Recoil</button>
        <TestStrappedProvider.Provider bootstrapData={TEST_BOOTSTRAP_DATA_1}>
          <Contents />
        </TestStrappedProvider.Provider>
      </RecoilRoot>
    );
  }

  render(<TestApp />);
  await userEvent.click(screen.getByText('Reset Recoil'));
});
