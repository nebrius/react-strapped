import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { createStrappedProvider } from '../src/core';

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

test('Bootstrapped atoms synchronously initialize their values correctly', () => {
  const TestBootstrapRoot = createStrappedProvider<TestBootstrapData>();
  const useTestBootstrappedAtom = TestBootstrapRoot.createBootstrappedValue(
    (bootstrapData) => {
      expect(bootstrapData).toStrictEqual(TEST_BOOTSTRAP_DATA);
      return bootstrapData.user;
    },
  );

  function TestApp() {
    expect(useTestBootstrappedAtom()).toStrictEqual(TEST_BOOTSTRAP_DATA.user);
    return null;
  }

  render(
    <TestBootstrapRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA}>
      <TestApp />
    </TestBootstrapRoot.Provider>,
  );
});
