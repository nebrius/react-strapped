import {
  bootstrapRootAtom,
  bootstrappedAtom,
  bootstrappedAtomValueHook
} from '../..';

interface MyState {
  currentUser: {
    name: string;
    age: number;
  }
}

export const myBootstrapRootAtom = bootstrapRootAtom<MyState>(
  'myBootstrapRootAtom',
);

const currentUserAtom = bootstrappedAtom(myBootstrapRootAtom, {
  key: 'currentUserAtom',
  initialValue: ({ currentUser }) => currentUser,
});


export const useCurrentUser = bootstrappedAtomValueHook(currentUserAtom);