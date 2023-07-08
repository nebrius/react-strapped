import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { getUniqueTestKey } from './util';
import { createBootstrapRoot, bootstrappedAtom } from '../src';

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
  const TestBootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  const testBootstrappedAtom = bootstrappedAtom(TestBootstrapRoot, {
    key: getUniqueTestKey(),
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
      <TestBootstrapRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA}>
        <TestApp />
      </TestBootstrapRoot.Provider>
    </RecoilRoot>,
  );
});

test("Bootstrapped atoms aren't allowed to have a default prop", () => {
  const BootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  expect(() =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    bootstrappedAtom(BootstrapRoot, {
      key: getUniqueTestKey(),
      default: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ).toThrow();
});
