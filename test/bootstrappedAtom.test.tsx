import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { getUniqueTestKey } from './util';
import { createBootstrapRoot } from '../src';

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
  const testBootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  const [testBootstrappedAtom] = testBootstrapRoot.bootstrappedAtom({
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
      <testBootstrapRoot.Provider bootstrapData={TEST_BOOTSTRAP_DATA}>
        <TestApp />
      </testBootstrapRoot.Provider>
    </RecoilRoot>,
  );
});

test("Bootstrapped atoms aren't allowed to have a default prop", () => {
  const testBootstrapRoot = createBootstrapRoot<TestBootstrapData>();
  expect(() =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    testBootstrapRoot.bootstrappedAtom({
      key: getUniqueTestKey(),
      default: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ).toThrow();
});
