# Recoil Bootstrap

Recoil Bootstrap provides mechanisms that make it straightforward to initialize Recoil with runtime bootstrap data in multi-page applications. Recoil is intentionally small with no runtime dependencies.

- [Motivation](#motivation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Multi-page Apps](#multi-page-apps)
- [API Specification](#api-specification)
  - [`rootAtom(key)`](#rootatomkey)
  - [`bootstrappedAtom(rootAtom, options)`](#bootstrappedatomrootatom-options)
  - [`bootstrappedAtomValueHook(bootstrappedAtom)`](#bootstrappedatomvaluehookbootstrappedatom)
  - [`<BootstrapRoot bootstrapData={} rootAtom={}>...</BootstrapRoot>`](#bootstraproot-bootstrapdata-rootatombootstraproot)
- [License](#license)

## Motivation

[Recoil](https://recoiljs.org/) is a popular new state management framework for React with a powerful, yet simple, API. However, initializing Recoil with runtime bootstrap data [is tricky and non-obvious](https://github.com/facebookexperimental/Recoil/issues/750), especially when used with multi-page app frameworks such as [Next.js](https://nextjs.org/). Specific challenges include:

1. In multi-page apps, Recoil must be initialized with bootstrap data that's been prop-drilled to a component
     - Thus, bootstrap data is not available to use with the `default` property in the atom descriptor, preventing us from using the standard way of initializing atoms.
     - The recommended way to solve this challenge is to initialize atoms with the `initializeState` property in `RecoilRoot`. As we'll see in challenge 2, this is not viable in multi-page apps.
2. Bootstrap data varies from page to page
     - Thus, we need to initialize _different atoms_ depending on which page we're on.
     - While it's possible, if unwieldy, to use a `switch(currentRoute)` statement to _initialize_ the atoms, we have to statically import _every_ atom from _every_ page to do the initialization.
     - Dynamic imports are asynchronous, and thus are incompatible with the synchronous `initializeState` prop, which is otherwise the only way to conditionally import atoms based on the current route.
3. State needs to be scoped to a React context and not used globally
     - A Next.js server is rendering multiple requests from multiple users more or less at once, meaning global data is not an option since it wouldn't be "scoped" to a specific user.
     - This means we can't do tricks like creating a global promise we attach to each atoms `default` prop, and then resolving it once we get the bootstrap data.

All of these challenges together mean that Recoil does not currently include any mechanisms for conveniently initializing Recoil with bootstrapped data in multi-page applications. Recoil Bootstrap provides these mechanisms.

## Installation

Install Recoil Bootstrap from npm with:

```
npm install recoil-bootstrap
```

## Getting Started

Recoil Bootstrap works by creating "root atoms," which are special opaque atoms that hold scoped bootstrap data initialized on first render. These atoms are not accessed directly. To access this data, we then create "bootstrapped atoms" which initialize themselves from their root atom. These bootstrapped atoms can then be used to create hooks for reading this data safely, ensuring that code only access data available in the React component tree the data is intended for.

This example shows a minimal example using Recoil Bootstrap. It's written in TypeScript to a) demonstrate how TypeScript types flows through the library and b) to give a sense of what data is expected where. You can absolutely use this library without using TypeScript though.

First, let's create some atoms in a file called `state.ts`:

```tsx
import {
  rootAtom,
  bootstrappedAtom,
  bootstrappedAtomValueHook,
} from 'recoil-bootstrap';

export interface MyBootstrapData {
  currentUser: {
    name: string;
    age: number;
  };
}

// See how this root atom only takes in a key, and is otherwise unconfigurable.
// By specifying the shape of data here in the TypeScript generic, we get full
// typing throughout the rest of our atoms/hooks/components/etc.
export const myRootAtom = rootAtom<MyBootstrapData>('myRootAtom');

// Now we create a bootstrapped atom from the root atom to access bootstrap data
const currentUserAtom = bootstrappedAtom(myRootAtom, {
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

import type { MyBootstrapData } from './state';
import { myRootAtom, useCurrentUser } from './state';

function MyComponent() {
  // We use the hook created above, which makes sure that we're calling this
  // hook in a component with <BootstrapRoot> as a parent in the component tree
  const currentUser = useCurrentUser();
  return (
    // Prints "Hello Philip J Fry"
    <div>Hello {currentUser.name}</div>
  );
}

interface PageProps {
  bootstrapData: MyBootstrapData;
}

// If you're not familiar with Next.js, this function runs on a server and is
// responsible for fetching bootstrap data. The value of the `props` property is
// passed as props to the default export in this file.
export function getServerSideProps() {
  const props: PageProps = {
    bootstrapData: {
      currentUser: {
        name: 'Philip J Fry',
        age: 1_026,
      },
    },
  };
  return { props };
}

// This default export is the root component in a Next.js page. The props
// passed to this component come from the server via `getServerSideProps`
export default function MyApp({ bootstrapData }: PageProps) {
  return (
    // We create our recoil root as normal, and then create our bootstrap root
    // with our bootstrap data and bootstrap atom. The <BootstrapRoot> component
    // does the work of correlating our bootstrapped atoms with bootstrap data.
    <RecoilRoot>
      <BootstrapRoot bootstrapData={bootstrapData} rootAtom={myRootAtom}>
        <MyComponent />
      </BootstrapRoot>
    </RecoilRoot>
  );
}
```

## Multi-page Apps

Recoil Bootstrap is designed specifically for multi-page applications, which it enables via multiple `<BootstrapRoot>` components. You can have as many bootstrap roots as you want with any amount of nesting.

In multi-page applications, we often have a set of bootstrap data that is common to all pages as well as bootstrap data that is specific to a page.

With Recoil Bootstrap, you can create one bootstrap root for the common bootstrap data that exists on all pages, and then per-page bootstrap roots that contain that pages data.

This would look like:

```tsx
function AppWrapper({ commonBootstrapData, children }) {
  return (
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={commonBootstrapData}
        rootAtom={commonRootAtom}
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
        rootAtom={myPageRootAtom}
      >
      </BootstrapRoot>
    </AppWrapper>
  )
}
```

If bootstrap data exists across a few pages, you can create a third bootstrap root for them that is shared between them.

When using multiple roots, hooks for accessing data provide guardrails against accessing data from the wrong place. If you try and call a bootstrapped hook based on `myPageRootAtom` on a different page, then you'll get a human readable error saying you're trying to access it from the wrong place, like so:

<br />
<p align="center">
  <img src="img/access-error.png" width="480" alt="Image showing a hook access error" />
</p>

For an in-depth example of a multi-page Next.js app using Recoil Bootstrap, see my [recoil-prototyping](https://github.com/nebrius/recoil-prototyping) repository.

## API Specification

### `rootAtom(key)`

Creates a root atom.

```ts
function rootAtom<T>(key: string): RecoilState<T>
```

_**Props:**_

`key`: `string`

The key to assign to the root atom.

_**Returns:**_

The root atom to be passed to a corresponding [BoostrapRoot](#BootstrapRoot) component.

### `bootstrappedAtom(rootAtom, options)`

Creates a bootstrapped atom for accessing bootstrap data.

```ts
type BootstrappedAtomOptions<AtomValue, BootstrapData> = Omit<
  AtomOptions<AtomValue>,
  'default'
> & {
  initialValue: (bootstrapData: BootstrapData) => AtomValue;
};

function bootstrappedAtom<AtomValue, BootstrapData>(
  rootAtom: RecoilValue<BootstrapData>,
  options: BootstrappedAtomOptions<AtomValue, BootstrapData>
): RecoilState<AtomValue>
```

_**Props:**_

`rootAtom`: `RecoilValue<BootstrapData>`

The root atom containing the bootstrap data to initialize this atom with.

`options`: `BootstrappedAtomOptions<AtomValue, BootstrapData>`

Options here are the mostly the same as the options passed to the built-in `atom()` function in Recoil. The difference is that the `default` property is _not_ allowed, and there is a new `initialValue` function to replace `default`.

`options.initialValue`: `(bootstrapData: BootstrapData) => AtomValue`

A function to initialize the bootstrapped atom with. This function is called at runtime with all of the bootstrap data passed to [BoostrapRoot](#BootstrapRoot)

_**Returns:**_

The bootstrapped atom that can then be passed to [bootstrappedAtomValueHook](#bootstrappedAtomValueHook) to create a hook for safely accessing this data. The returned atom is a normal off-the-shelf Recoil atom, and can be used accordingly.

_**Throws:**_

This function will throw an exception if a `default` value is included in `options`.

### `bootstrappedAtomValueHook(bootstrappedAtom)`

Creates a hook for accessing a bootstrapped atom's value safely.

```ts
function bootstrappedAtomValueHook<T>(bootstrappedAtom: RecoilValue<T>): () => T
```

_**Props:**_

`bootstrappedAtom`: `RecoilValue<T>`

The bootstrapped atom to create the accessor hook for

_**Returns:**_

The hook that accesses the value.

_**Throws:**_

Calling the hook returned from this function in the wrong scope will throw an exception. "Wrong scope" is defined as calling this hook in a component that does not have the corresponding `BootstrapRoot` further up the component tree.

### `<BootstrapRoot bootstrapData={} rootAtom={}>...</BootstrapRoot>`

This component takes bootstrap data and initializes all root atoms and associated bootstrapped atoms.

```ts
interface LocalizedStateProps<BootstrapData> {
  bootstrapData: BootstrapData;
  rootAtom: RecoilState<BootstrapData>;
}

function BootstrapRoot<BootstrapData>(
  props: PropsWithChildren<LocalizedStateProps<BootstrapData>>
): JSX.Element | null
```
_**Props:**_

`bootstrapData`: `BootstrapData`

The bootstrap data to initialize bootstrapped atoms with.

`rootAtom`: `RecoilState<BootstrapData>`

The root atom to store the data, which in turn initializes all bootstrapped atoms associated with it.

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
