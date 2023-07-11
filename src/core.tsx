import {
  type PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import React from 'react';

type Initializer<StrapValue, BootstrapData> = (
  bootstrapData: BootstrapData,
) => StrapValue;

interface BootstrapRootContextProps {
  strapValues: Map<string, unknown>;
  updateStrap: (strapKey: string, newValue: unknown) => void;
}

let nextProviderId = 0;

// This context maintains all information about a given bootstrap root, and is
// mostly used to verify that things are being used in the correct place
const BootstrapRootContext = createContext<BootstrapRootContextProps>({
  strapValues: new Map(),
  updateStrap: () => {
    // Do nothing
  },
});

const BootstrapInfoContext = createContext<{ rootIds: number[] }>({
  rootIds: [],
});

// TODO: this won't work, cause currently only the root knows about strap
// values. Strap values need to be hosted at their provider level, but with some
// way of referencing the parent one too

export function createStrappedProvider<BootstrapData>() {
  const providerId = nextProviderId++;
  let nextStrapId = 0;

  const attachedStraps: Map<
    string,
    Initializer<unknown, BootstrapData>
  > = new Map();
  function createBootstrappedState<StrapValue>(
    initializer: Initializer<StrapValue, BootstrapData>,
  ) {
    const strapKey = `${providerId}:${nextStrapId++}`;
    attachedStraps.set(strapKey, initializer);

    function useValidateContext() {
      const bootstrapInfoContext = useContext(BootstrapInfoContext);
      if (!bootstrapInfoContext.rootIds.includes(providerId)) {
        throw new Error(
          "Strap not loaded. Did you call this hook outside of a descendant of this strap's <Provider> component?",
        );
      }
    }

    function useValue() {
      useValidateContext();
      const bootstrapRootContext = useContext(BootstrapRootContext);
      if (!bootstrapRootContext.strapValues.has(strapKey)) {
        throw new Error(
          `Internal Error: strap value missing in context provider. This is a bug, please report it at https://github.com/nebrius/recoil-bootstrap`,
        );
      }
      return bootstrapRootContext.strapValues.get(strapKey) as StrapValue;
    }

    function useSetValue(newValue: StrapValue) {
      useValidateContext();
      const bootstrapRootContext = useContext(BootstrapRootContext);
      bootstrapRootContext.updateStrap(strapKey, newValue);
    }

    return [useValue, useSetValue] as const;
  }

  function createBootstrappedValue<StrapValue>(
    initializer: Initializer<StrapValue, BootstrapData>,
  ) {
    return createBootstrappedState(initializer)[0];
  }

  function Provider({
    children,
    bootstrapData,
  }: PropsWithChildren<{ bootstrapData: BootstrapData }>) {
    const parentBootstrapInfoContext = useContext(BootstrapInfoContext);

    const initialStrapValues = useMemo(() => {
      const values = new Map<string, unknown>();
      for (const [strapKey, initializer] of attachedStraps) {
        values.set(strapKey, initializer(bootstrapData));
      }
      return values;
    }, [bootstrapData]);

    const [strapValues, setStrapValues] = useState(initialStrapValues);

    const updateStrap = useCallback(
      (strapKey: string, newValue: unknown) => {
        const clonedStrapValues = new Map(strapValues);
        clonedStrapValues.set(strapKey, newValue);
        setStrapValues(clonedStrapValues);
      },
      [strapValues, setStrapValues],
    );

    const contextValue: BootstrapRootContextProps = {
      strapValues,
      updateStrap,
    };

    if (parentBootstrapInfoContext.rootIds.length) {
      return (
        <BootstrapInfoContext.Provider
          value={{
            rootIds: [...parentBootstrapInfoContext.rootIds, providerId],
          }}
        >
          {children}
        </BootstrapInfoContext.Provider>
      );
    } else {
      return (
        <BootstrapRootContext.Provider value={contextValue}>
          <BootstrapInfoContext.Provider value={{ rootIds: [providerId] }}>
            {children}
          </BootstrapInfoContext.Provider>
        </BootstrapRootContext.Provider>
      );
    }
  }

  return {
    createBootstrappedState,
    createBootstrappedValue,
    Provider,
  };
}
