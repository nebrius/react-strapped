import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

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
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom1',
  );
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: 'testBootstrappedAtom1',
    initialValue: ({ user }) => user,
  });
  const testValueHook = bootstrappedAtomValueHook(testBootstrappedAtom);

  function TestApp() {
    expect(testValueHook()).toStrictEqual(TEST_BOOTSTRAP_DATA.user);
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
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom1',
  );
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: 'testBootstrappedAtom1',
    initialValue: ({ user }) => user,
  });
  const testValueHook = bootstrappedAtomValueHook(testBootstrappedAtom);

  function TestApp() {
    expect(() => testValueHook()).toThrow(
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

test('BootstrappedAtomValueHook cannot be referenced outside of its bootstrap root', () => {
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom1',
  );
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: 'testBootstrappedAtom1',
    initialValue: ({ user }) => user,
  });
  const testValueHook = bootstrappedAtomValueHook(testBootstrappedAtom);

  function OuterTestApp() {
    expect(() => testValueHook()).toThrow(
      'Bootstrapped atom not loaded. Did you call this hook outside of a descendant of its <BootstrapRoot> component?',
    );
    return null;
  }

  // Intentionally render without a bootstrap root to throw an exception
  render(
    <RecoilRoot>
      <OuterTestApp />
    </RecoilRoot>,
  );
});