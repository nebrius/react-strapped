import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { createStrap } from '../src';

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

test('useStrappedValue returns the correct value', () => {
  const TestStrappedRoot = createStrap<TestBootstrapData>();
  const useStrappedValue = TestStrappedRoot.createUseStrappedValue(
    ({ user }) => user,
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

test('useStrappedValue cannot be referenced without a strapped provider', () => {
  const TestStrappedRoot = createStrap<TestBootstrapData>();
  const useStrappedValue = TestStrappedRoot.createUseStrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useStrappedValue();
    }).toThrow(
      "Strap not available. Did you call this hook outside of a descendant of this strap's <Provider> component?",
    );
    return null;
  }

  // Intentionally render without a strapped provider to throw an exception
  render(<TestApp />);
});
