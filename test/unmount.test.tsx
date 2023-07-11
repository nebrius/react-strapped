import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

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
  const useTestValue = TestStrappedProvider.createUseStrappedValue(
    ({ user }) => user,
  );

  let testValue: TestBootstrapData['user'] | undefined;

  function Contents() {
    testValue = useTestValue();
    return null;
  }

  function TestApp() {
    const [key, setKey] = useState(0);

    return (
      <>
        <button onClick={() => setKey(1)}>Reset Provider</button>
        <TestStrappedProvider.Provider
          key={`test-${key}`}
          bootstrapData={key ? TEST_BOOTSTRAP_DATA_2 : TEST_BOOTSTRAP_DATA_1}
        >
          <Contents />
        </TestStrappedProvider.Provider>
      </>
    );
  }

  render(<TestApp />);

  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Reset Provider'));
  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_2.user);
});

test('Unmounts with Recoil root cleanly', async () => {
  const TestStrappedProvider = createStrappedProvider<TestBootstrapData>();
  const useTestBootstrappedAtomValue =
    TestStrappedProvider.createUseStrappedValue(({ user }) => user);

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
      <>
        <button onClick={() => setShouldRender(false)}>Reset Recoil</button>
        <TestStrappedProvider.Provider bootstrapData={TEST_BOOTSTRAP_DATA_1}>
          <Contents />
        </TestStrappedProvider.Provider>
      </>
    );
  }

  render(<TestApp />);
  await userEvent.click(screen.getByText('Reset Recoil'));
});
