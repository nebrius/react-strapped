import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

import { createStrappedProvider } from '../src/core';

interface OuterTestBootstrapData {
  ship: {
    name: string;
    class: 'cargo' | 'passenger';
  };
}

const OUTER_TEST_BOOTSTRAP_DATA: OuterTestBootstrapData = {
  ship: {
    name: 'Planet Express Ship',
    class: 'cargo',
  },
};

interface InnerTestBootstrapData {
  user: {
    name: string;
    age: number;
  };
}

const INNER_TEST_BOOTSTRAP_DATA: InnerTestBootstrapData = {
  user: {
    name: 'Philip J. Fry',
    age: 1026,
  },
};

test('Bootstrap roots can be nested', () => {
  const OuterTestBootstrapRoot =
    createStrappedProvider<OuterTestBootstrapData>();
  const useOuterTestValueHook = OuterTestBootstrapRoot.createBootstrappedValue(
    ({ ship }) => ship,
  );

  const InnerTestBootstrapRoot =
    createStrappedProvider<InnerTestBootstrapData>();
  const useInnerTestValueHook = InnerTestBootstrapRoot.createBootstrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(useOuterTestValueHook()).toStrictEqual(
      OUTER_TEST_BOOTSTRAP_DATA.ship,
    );
    expect(useInnerTestValueHook()).toStrictEqual(
      INNER_TEST_BOOTSTRAP_DATA.user,
    );
    return null;
  }

  render(
    <RecoilRoot>
      <OuterTestBootstrapRoot.Provider
        bootstrapData={OUTER_TEST_BOOTSTRAP_DATA}
      >
        <InnerTestBootstrapRoot.Provider
          bootstrapData={INNER_TEST_BOOTSTRAP_DATA}
        >
          <TestApp />
        </InnerTestBootstrapRoot.Provider>
      </OuterTestBootstrapRoot.Provider>
    </RecoilRoot>,
  );
});

test('Nested bootstrap roots cannot be accessed outside of their tree', () => {
  const OuterTestBootstrapRoot =
    createStrappedProvider<OuterTestBootstrapData>();
  const useOuterTestValueHook = OuterTestBootstrapRoot.createBootstrappedValue(
    ({ ship }) => ship,
  );

  const InnerTestBootstrapRoot =
    createStrappedProvider<InnerTestBootstrapData>();
  const useInnerTestValueHook = InnerTestBootstrapRoot.createBootstrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(useOuterTestValueHook()).toStrictEqual(
      OUTER_TEST_BOOTSTRAP_DATA.ship,
    );
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useInnerTestValueHook();
    }).toThrow(
      "Strap not loaded. Did you call this hook outside of a descendant of this strap's <Provider> component?",
    );
    return null;
  }

  render(
    <RecoilRoot>
      <OuterTestBootstrapRoot.Provider
        bootstrapData={OUTER_TEST_BOOTSTRAP_DATA}
      >
        <InnerTestBootstrapRoot.Provider
          bootstrapData={INNER_TEST_BOOTSTRAP_DATA}
        />
        <TestApp />
      </OuterTestBootstrapRoot.Provider>
    </RecoilRoot>,
  );
});
