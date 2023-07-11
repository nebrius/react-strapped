import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

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
  const useStrappedState = TestStrappedProvider.createUseStrappedState(
    ({ user }) => user,
  );

  let testValue: TestBootstrapData['user'] | undefined;

  function TestApp() {
    const [value, setValue] = useStrappedState();
    testValue = value;
    return (
      <>
        <button onClick={() => setValue(TEST_BOOTSTRAP_DATA_2.user)}>
          Set Value
        </button>
      </>
    );
  }

  render(
    <TestStrappedProvider.Provider bootstrapData={TEST_BOOTSTRAP_DATA_1}>
      <TestApp />
    </TestStrappedProvider.Provider>,
  );

  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Set Value'));
  expect(testValue).toEqual(TEST_BOOTSTRAP_DATA_2.user);
});
