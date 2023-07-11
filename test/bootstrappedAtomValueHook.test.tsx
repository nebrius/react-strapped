import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

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

test('BootstrappedAtomValueHook returns the correct value', () => {
  const TestBootstrapRoot = createStrappedProvider<TestBootstrapData>();
  const useTestValueHook = TestBootstrapRoot.createBootstrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(useTestValueHook()).toStrictEqual(TEST_BOOTSTRAP_DATA.user);
    return null;
  }

  render(
    <RecoilRoot>
      <TestBootstrapRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA}>
        <TestApp />
      </TestBootstrapRoot.Provider>
    </RecoilRoot>,
  );
});

test('BootstrappedAtomValueHook cannot be referenced without a bootstrap root', () => {
  const TestBootstrapRoot = createStrappedProvider<TestBootstrapData>();
  const useTestValueHook = TestBootstrapRoot.createBootstrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTestValueHook();
    }).toThrow(
      "Strap not loaded. Did you call this hook outside of a descendant of this strap's <Provider> component?",
    );
    return null;
  }

  // Intentionally render without a bootstrap root to throw an exception
  render(
    <RecoilRoot>
      <TestApp />
    </RecoilRoot>,
  );
});
