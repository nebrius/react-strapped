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

interface ProviderContextProps {
  providerId: number;
  parentContext: ProviderContextProps | null;
  strapValues: Map<string, unknown>;
  updateStrap: (strapKey: string, newValue: unknown) => void;
}

let nextProviderId = 0;

// This context maintains all information about a given bootstrap root, and is
// mostly used to verify that things are being used in the correct place
const ProviderContext = createContext<ProviderContextProps | null>(null);

export function createStrappedProvider<BootstrapData>() {
  const providerId = nextProviderId++;
  let nextStrapId = 0;
  let hasRendered = false;

  function useGetContext() {
    let context = useContext(ProviderContext);
    while (context !== null) {
      if (context.providerId === providerId) {
        return context;
      }
      context = context.parentContext;
    }
    throw new Error(
      "Strap not loaded. Did you call this hook outside of a descendant of this strap's <Provider> component?",
    );
  }

  function initStrap(initializer: Initializer<unknown, BootstrapData>) {
    if (hasRendered) {
      throw new Error(
        'Cannot create straps after their strap provider has been rendered at least once',
      );
    }
    const strapKey = `${providerId}:${nextStrapId++}`;
    attachedStraps.set(strapKey, initializer);
    return strapKey;
  }

  const attachedStraps: Map<
    string,
    Initializer<unknown, BootstrapData>
  > = new Map();
  function createUseStrappedState<StrapValue>(
    initializer: Initializer<StrapValue, BootstrapData>,
  ) {
    const strapKey = initStrap(initializer);
    return () => {
      const context = useGetContext();
      const value = context.strapValues.get(strapKey) as StrapValue;

      const setValue = useCallback(
        (newValue: StrapValue) => {
          context.updateStrap(strapKey, newValue);
        },
        [context],
      );

      return [value, setValue] as const;
    };
  }

  function createUseStrappedValue<StrapValue>(
    initializer: Initializer<StrapValue, BootstrapData>,
  ) {
    const strapKey = initStrap(initializer);
    return () => useGetContext().strapValues.get(strapKey) as StrapValue;
  }

  function Provider({
    children,
    bootstrapData,
  }: PropsWithChildren<{ bootstrapData: BootstrapData }>) {
    hasRendered = true;
    const parentContext = useContext(ProviderContext);

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

    const contextValue = useMemo(
      () => ({
        providerId,
        parentContext,
        strapValues,
        updateStrap,
      }),
      [parentContext, strapValues, updateStrap],
    );

    return (
      <ProviderContext.Provider value={contextValue}>
        {children}
      </ProviderContext.Provider>
    );
  }

  return {
    createUseStrappedState,
    createUseStrappedValue,
    Provider,
  };
}