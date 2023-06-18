import type { AtomOptions, RecoilValue } from 'recoil';
import { atom, selector } from 'recoil';

type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

export function bootstrappedAtom<AtomValue, BootstrapData>(
  bootstrapRootAtom: RecoilValue<BootstrapData>,
  {
    initialValue,
    key,
    ...options
  }: BootstrappedAtomOptions<AtomValue, BootstrapData>,
) {
  if ('default' in options) {
    throw new Error(
      'The "default" prop is not allowed in bootstrapped atoms. Use "initialValue" instead',
    );
  }
  return atom({
    ...options,
    key,
    // We set the default to a selector so that we can grab the bootstrap data
    // from the bootstrapRootAtom, which is set in a BootstrapRoot component
    default: selector({
      key: `${key}:atomInitializer`,
      get: ({ get }) => initialValue(get(bootstrapRootAtom)),
    }),
  });
}
