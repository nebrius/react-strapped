import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createStrappedProvider } from '../src/core';

interface OuterTestBootstrapData {
  ship: {
    name: string;
    class: 'cargo' | 'passenger' | 'military';
  };
}

const OUTER_TEST_BOOTSTRAP_DATA_1: OuterTestBootstrapData = {
  ship: {
    name: 'Planet Express Ship',
    class: 'cargo',
  },
};

const OUTER_TEST_BOOTSTRAP_DATA_2: OuterTestBootstrapData = {
  ship: {
    name: 'Nimbus',
    class: 'military',
  },
};

interface InnerTestBootstrapData {
  user: {
    name: string;
    age: number;
  };
}

const INNER_TEST_BOOTSTRAP_DATA_1: InnerTestBootstrapData = {
  user: {
    name: 'Philip J. Fry',
    age: 1026,
  },
};

const INNER_TEST_BOOTSTRAP_DATA_2: InnerTestBootstrapData = {
  user: {
    name: 'Bender Bending Rodríguez',
    age: 4,
  },
};

test('Sets state', async () => {
  const TestStrappedProvider = createStrappedProvider<InnerTestBootstrapData>();
  const useStrappedState = TestStrappedProvider.createUseStrappedState(
    ({ user }) => user,
  );

  let testValue: InnerTestBootstrapData['user'] | undefined;

  function TestApp() {
    const [value, setValue] = useStrappedState();
    testValue = value;
    return (
      <>
        <button onClick={() => setValue(INNER_TEST_BOOTSTRAP_DATA_2.user)}>
          Set Value
        </button>
      </>
    );
  }

  render(
    <TestStrappedProvider.Provider bootstrapData={INNER_TEST_BOOTSTRAP_DATA_1}>
      <TestApp />
    </TestStrappedProvider.Provider>,
  );

  expect(testValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Set Value'));
  expect(testValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_2.user);
});

test('Sets outer state through an inner nested provider', async () => {
  const OuterTestStrappedProvider =
    createStrappedProvider<OuterTestBootstrapData>();
  const useOuterStrappedState =
    OuterTestStrappedProvider.createUseStrappedState(({ ship }) => ship);
  const InnerTestStrappedProvider =
    createStrappedProvider<InnerTestBootstrapData>();
  const useInnerStrappedValue =
    InnerTestStrappedProvider.createUseStrappedValue(({ user }) => user);

  let outerTestValue: OuterTestBootstrapData['ship'] | undefined;
  let innerTestValue: InnerTestBootstrapData['user'] | undefined;

  function TestApp() {
    const [value, setValue] = useOuterStrappedState();
    outerTestValue = value;
    innerTestValue = useInnerStrappedValue();
    return (
      <>
        <button onClick={() => setValue(OUTER_TEST_BOOTSTRAP_DATA_2.ship)}>
          Set Value
        </button>
      </>
    );
  }

  render(
    <OuterTestStrappedProvider.Provider
      bootstrapData={OUTER_TEST_BOOTSTRAP_DATA_1}
    >
      <InnerTestStrappedProvider.Provider
        bootstrapData={INNER_TEST_BOOTSTRAP_DATA_1}
      >
        <TestApp />
      </InnerTestStrappedProvider.Provider>
    </OuterTestStrappedProvider.Provider>,
  );

  expect(outerTestValue).toEqual(OUTER_TEST_BOOTSTRAP_DATA_1.ship);
  expect(innerTestValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Set Value'));
  expect(outerTestValue).toEqual(OUTER_TEST_BOOTSTRAP_DATA_2.ship);
  expect(innerTestValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_1.user);
});

test('Sets inner state with an outer nested provider', async () => {
  const OuterTestStrappedProvider =
    createStrappedProvider<OuterTestBootstrapData>();
  const useOuterStrappedvalue =
    OuterTestStrappedProvider.createUseStrappedValue(({ ship }) => ship);
  const InnerTestStrappedProvider =
    createStrappedProvider<InnerTestBootstrapData>();
  const useInnerStrappedState =
    InnerTestStrappedProvider.createUseStrappedState(({ user }) => user);

  let outerTestValue: OuterTestBootstrapData['ship'] | undefined;
  let innerTestValue: InnerTestBootstrapData['user'] | undefined;

  function TestApp() {
    const [value, setValue] = useInnerStrappedState();
    innerTestValue = value;
    outerTestValue = useOuterStrappedvalue();
    return (
      <>
        <button onClick={() => setValue(INNER_TEST_BOOTSTRAP_DATA_2.user)}>
          Set Value
        </button>
      </>
    );
  }

  render(
    <OuterTestStrappedProvider.Provider
      bootstrapData={OUTER_TEST_BOOTSTRAP_DATA_1}
    >
      <InnerTestStrappedProvider.Provider
        bootstrapData={INNER_TEST_BOOTSTRAP_DATA_1}
      >
        <TestApp />
      </InnerTestStrappedProvider.Provider>
    </OuterTestStrappedProvider.Provider>,
  );

  expect(outerTestValue).toEqual(OUTER_TEST_BOOTSTRAP_DATA_1.ship);
  expect(innerTestValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_1.user);

  await userEvent.click(screen.getByText('Set Value'));
  expect(outerTestValue).toEqual(OUTER_TEST_BOOTSTRAP_DATA_1.ship);
  expect(innerTestValue).toEqual(INNER_TEST_BOOTSTRAP_DATA_2.user);
});
