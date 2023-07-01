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

test('Bootstrapped atoms are passed initial bootstrap values', async () => {
  const testRootAtom = rootAtom<TestBootstrapData>(
    'testRootAtomForBootstrappedAtom1',
  );
  const mockedInitialValue = jest.fn();
  const testBootstrappedAtom = bootstrappedAtom(testRootAtom, {
    key: 'testBootstrappedAtom1',
    initialValue: mockedInitialValue,
  });

  function TestApp() {
    // Atom values have to be referenced before they're initialized, so we
    // reference it here and discard the value, since we don't need.
    useRecoilValue(testBootstrappedAtom);
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

  expect(mockedInitialValue).toHaveBeenCalledWith(TEST_BOOTSTRAP_DATA);
});
