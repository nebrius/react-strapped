import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

import { getUniqueTestKey } from './util';
import {
  createBootstrapRoot,
  bootstrappedAtom,
  bootstrappedAtomValueHook,
} from '../src';

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
  const TestBootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  const testBootstrappedAtom = bootstrappedAtom(TestBootstrapRoot, {
    key: getUniqueTestKey(),
    initialValue: ({ user }) => user,
  });
  const useTestValueHook = bootstrappedAtomValueHook(testBootstrappedAtom);

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
  const TestBootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  const testBootstrappedAtom = bootstrappedAtom(TestBootstrapRoot, {
    key: getUniqueTestKey(),
    initialValue: ({ user }) => user,
  });
  const useTestValueHook = bootstrappedAtomValueHook(testBootstrappedAtom);

  function TestApp() {
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTestValueHook();
    }).toThrow(
      'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
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
