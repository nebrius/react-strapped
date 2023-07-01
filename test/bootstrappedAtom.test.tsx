import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { BootstrapRoot, bootstrappedAtom, rootAtom } from '../src';

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

test('Bootstrapped atoms initialize their values correctly', () => {
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom1',
  );
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: 'testBootstrappedAtom1',
    initialValue(bootstrapData) {
      expect(bootstrapData).toStrictEqual(TEST_BOOTSTRAP_DATA);
      return bootstrapData.user;
    },
  });

  function TestApp() {
    expect(useRecoilValue(testBootstrappedAtom)).toStrictEqual(
      TEST_BOOTSTRAP_DATA.user,
    );
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

test("Bootstrapped atoms aren't allowed to have a default prop", () => {
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom2',
  );
  expect(() =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    bootstrappedAtom(testRootAtom, {
      key: 'testBootstrappedAtom2',
      default: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ).toThrow();
});
