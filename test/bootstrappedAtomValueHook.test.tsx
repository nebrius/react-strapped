import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

import { getUniqueTestKey } from './util';
import {
  BootstrapRoot,
  bootstrappedAtom,
  bootstrappedAtomValueHook,
  rootAtom,
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
  const testRootAtom = rootAtom<TestBootstrapData>(getUniqueTestKey());
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
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
      <BootstrapRoot
        bootstrapData={TEST_BOOTSTRAP_DATA}
        rootAtom={testRootAtom}
      >
        <TestApp />
      </BootstrapRoot>
    </RecoilRoot>,
  );
});

test('BootstrappedAtomValueHook cannot be referenced without a bootstrap root', () => {
  const testRootAtom = rootAtom<TestBootstrapData>(getUniqueTestKey());
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
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
