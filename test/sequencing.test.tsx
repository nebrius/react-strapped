import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { createStrappedProvider } from '../src';

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
  const TestStrappedRoot = createStrappedProvider<TestBootstrapData>();

  render(<TestStrappedRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA} />);

  expect(() => TestStrappedRoot.createUseStrappedValue(() => 10)).toThrow(
    'Cannot create straps after their strap provider has been rendered at least once',
  );
});
