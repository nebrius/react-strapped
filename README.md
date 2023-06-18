# Recoil Bootstrap

[Recoil](https://recoiljs.org/) is a popular new state management framework for
React with a powerful yet simple API. However, initializing Recoil with runtime
bootstrap data [is tricky and
non-obvious](https://github.com/facebookexperimental/Recoil/issues/750),
especially when used with multi-page app frameworks such as
[Next.js](https://nextjs.org/).

Recoil bootstrap provides some helpers that make working with bootstrap data in
Recoil more straightfoward.

Recoil bootstrap works by creating "root atoms," which are special opaque atoms
that hold bootstrap data. These atoms are not accessed directly. To acccess this
data, we then create "bootstrapped atoms" which initialize themselves from a
root atom. These bootstrapped atoms can then be used to create hooks for reading
this data safely.

## Installation

Install Recoil Bootstrap from npm with:

```
npm install recoil-bootstrap
```

## Getting Started

First, let's create some atoms in a file called `state.ts`:

```tsx
import {
  bootstrapRootAtom,
  bootstrappedAtom,
  bootstrappedAtomValueHook
} from 'recoil-bootstrap';

interface MyBootstrapData {
  currentUser: {
    name: string;
    age: number;
  }
}

// Note how this root atom only takes in a key, and is otherwise unconfigurable.
// By specifying the shape of state here, we get full typing throughout the rest
// of our atoms/hooks/components/etc.
export const myBootstrapRootAtom = bootstrapRootAtom<MyBootstrapData>(
  'myBootstrapRootAtom',
);

// Now we create a bootstrapped atom from the root atom to access bootstrap data
const currentUserAtom = bootstrappedAtom(myBootstrapRootAtom, {
  key: 'currentUserAtom',
  initialValue: ({ currentUser }) => currentUser,
});

// Lastly we create the hook for safely accessing this data. If this hook is
// called in an incorrect way, such as before initialization or in a
// non-bootstrapped component, it will error with a human readable message
export const useCurrentUser = bootstrappedAtomValueHook(currentUserAtom);
```

Now let's create some UI in a Next.js page component:

```tsx
import { RecoilRoot } from 'recoil';
import { BootstrapRoot } from 'recoil-bootstrap';
import { myBootstrapRootAtom, useCurrentUser } from './state';

function MyComponent() {
  // We use the hook created above, which makes sure that we're calling this
  // hook in a component with <BootstrapRoot> as a parent in the component tree
  const currentUser = useCurrentUser();
  return (
    // Prints "Hello Philip J Fry"
    <div>Hello {currentUser.name}</div>
  );
}

// If you're not familiar with Next.js, this function runs on a server and is
// responsible for fetching bootstrap data. The value of the `props` property is
// passed as props to the default export in this file.
export function getServerSideProps() {
  return {
    props: {
      bootstrapData: {
        currentUser: {
          name: 'Philip J Fry',
          age: 1_026
        }
      }
    }
  };
}

// This default export is the root component in a Next.js page. The props
// passed to this component come from the server
export default function MyApp({ bootstrapData }) {
  return (
    // We create our recoil root as normal, and then create our bootstrap root
    // with our bootstrap data and bootstrap atom. The BootstrapRoot component
    // does the work of correlating our bootstrapped atoms with bootstrap data.
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={bootstrapData}
        bootstrapRootAtom={myBootstrapRootAtom}
      >
        <MyComponent />
      </BootstrapRoot>
    </RecoilRoot>
  );
}
```

## Multipage Apps

You can have as many bootstrap roots as you want with any amount of nesting.
Recoil Bootstrap is designed specifically for multi-page applications. In these
applications, we often have a set of bootstrap data that is common to all pages,
as well as bootstrap data that is specific to a page.

With Recoil Bootstrap, you can create one bootstrap root for the common
bootstrap data that exists on all pages, and then per-page bootstrap roots that
contain that pages data. If bootstrap data exists across a few pages, you can
create a third bootstrap root for them.

This would look like:

```tsx
function AppWrapper({ commonBootstrapData, children }) {
  return (
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={commonBootstrapData}
        bootstrapRootAtom={commonBootstrapRootAtom}
      >
      </BootstrapRoot>
    </RecoilRoot>
  );
}

export default function MyPage({ commonBootstrapData, myPageBootstrapData }) {
  return (
    <AppWrapper>
      <BootstrapRoot
        bootstrapData={myPageBootstrapData}
        bootstrapRootAtom={myPageBootstrapRootAtom}
      >
      </BootstrapRoot>
    </AppWrapper>
  )
}
```

When using multiple roots, hooks for accessing data provide guardrails against
accessing data from the wrong place. If you try and call a bootstrapped hook
based on `myPageBootstrapRootAtom` on a different page, then you'll get a human
readable error saying you're trying to access it from the wrong place, like so:

<br />
<p align="center">
  <img src="img/access-error.png" width="480" alt="Image showing a hook access error" />
</p>

## API

### bootstrapRootAtom

```ts
function bootstrapRootAtom<T>(key: string): RecoilState<T>
```

### bootstrappedAtom

```ts
type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

function bootstrappedAtom<AtomValue, BootstrapData>(
  bootstrapRootAtom: RecoilValue<BootstrapData>,
  options: BootstrappedAtomOptions<AtomValue, BootstrapData>
): RecoilState<AtomValue>
```

### bootstrappedAtomValueHook

```ts
function bootstrappedAtomValueHook<T>(bootstrappedAtom: RecoilValue<T>): () => T
```

### BootstrapRoot

```ts
interface LocalizedStateProps<BootstrapData> {
  bootstrapData: BootstrapData;
  bootstrapRootAtom: RecoilState<BootstrapData>;
}

function BootstrapRoot<BootstrapData>(
  props: PropsWithChildren<LocalizedStateProps<BootstrapData>>
): JSX.Element | null
```

## License

MIT License

Copyright (c) 2023 Bryan Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
