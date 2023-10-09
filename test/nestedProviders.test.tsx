import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { createStrap } from '../src';

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

test('Strapped providers can be nested', () => {
  const OuterTestStrappedRoot = createStrap<OuterTestBootstrapData>();
  const useOuterTestValue = OuterTestStrappedRoot.createUseStrappedValue(
    ({ ship }) => ship,
  );

  const InnerTestStrappedRoot = createStrap<InnerTestBootstrapData>();
  const useInnerTestValue = InnerTestStrappedRoot.createUseStrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(useOuterTestValue()).toStrictEqual(OUTER_TEST_BOOTSTRAP_DATA.ship);
    expect(useInnerTestValue()).toStrictEqual(INNER_TEST_BOOTSTRAP_DATA.user);
    return null;
  }

  render(
    <OuterTestStrappedRoot.Provider bootstrapData={OUTER_TEST_BOOTSTRAP_DATA}>
      <InnerTestStrappedRoot.Provider bootstrapData={INNER_TEST_BOOTSTRAP_DATA}>
        <TestApp />
      </InnerTestStrappedRoot.Provider>
    </OuterTestStrappedRoot.Provider>,
  );
});

test('Nested strapped providers cannot be accessed outside of their tree', () => {
  const OuterTestStrappedRoot = createStrap<OuterTestBootstrapData>();
  const useOuterTestValue = OuterTestStrappedRoot.createUseStrappedValue(
    ({ ship }) => ship,
  );

  const InnerTestStrappedRoot = createStrap<InnerTestBootstrapData>();
  const useInnerTestValue = InnerTestStrappedRoot.createUseStrappedValue(
    ({ user }) => user,
  );

  function TestApp() {
    expect(useOuterTestValue()).toStrictEqual(OUTER_TEST_BOOTSTRAP_DATA.ship);
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useInnerTestValue();
    }).toThrow(
      "Strap not available. Did you call this hook outside of a descendant of this strap's <Provider> component?",
    );
    return null;
  }

  render(
    <OuterTestStrappedRoot.Provider bootstrapData={OUTER_TEST_BOOTSTRAP_DATA}>
      <InnerTestStrappedRoot.Provider
        bootstrapData={INNER_TEST_BOOTSTRAP_DATA}
      />
      <TestApp />
    </OuterTestStrappedRoot.Provider>,
  );
});
