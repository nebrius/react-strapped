import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

import { createStrap } from '../src';

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
  const TestStrappedProvider = createStrap<TestBootstrapData>();
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

test("Doesn't reset straps after changing bootstrap data", async () => {
  const TestStrappedProvider = createStrap<TestBootstrapData>();
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
        <button onClick={() => setKey(1)}>Reset Data</button>
        <TestStrappedProvider.Provider
          bootstrapData={key ? TEST_BOOTSTRAP_DATA_2 : TEST_BOOTSTRAP_DATA_1}
        >
          <Contents />
        </TestStrappedProvider.Provider>
      </>
    );
  }

  render(<TestApp />);

  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Reset Data'));
  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);
});
