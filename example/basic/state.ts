import {
  bootstrapRootAtom,
  bootstrappedAtom,
  bootstrappedAtomValueHook,
} from '../..';

export interface MyBootstrapData {
  currentUser: {
    name: string;
    age: number;
  };
}

export const myBootstrapRootAtom = bootstrapRootAtom<MyBootstrapData>(
  'myBootstrapRootAtom',
);

const currentUserAtom = bootstrappedAtom(myBootstrapRootAtom, {
  key: 'currentUserAtom',
  initialValue: ({ currentUser }) => currentUser,
});

export const useCurrentUser = bootstrappedAtomValueHook(currentUserAtom);
