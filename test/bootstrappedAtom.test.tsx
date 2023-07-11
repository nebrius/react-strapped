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

test('Strapped providers synchronously initialize their values correctly', () => {
  const TestStrappedRoot = createStrappedProvider<TestBootstrapData>();
  const useStrappedValue = TestStrappedRoot.createUseStrappedValue(
    (bootstrapData) => {
      expect(bootstrapData).toStrictEqual(TEST_BOOTSTRAP_DATA);
      return bootstrapData.user;
    },
  );

  function TestApp() {
    expect(useStrappedValue()).toStrictEqual(TEST_BOOTSTRAP_DATA.user);
    return null;
  }

  render(
    <TestStrappedRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA}>
      <TestApp />
    </TestStrappedRoot.Provider>,
  );
});
