# React Strapped

<p align="center">
  <img alt="version" src="https://img.shields.io/npm/v/react-strapped" />
  <a href="https://bundlephobia.com/package/react-strapped">
    <img alt="bundle size" src="https://img.shields.io/bundlephobia/min/react-strapped" />
  </a>
  <a href="https://github.com/nebrius/react-strapped/actions/workflows/tests.yml">
    <img alt="build status" src="https://github.com/nebrius/react-strapped/actions/workflows/tests.yml/badge.svg" />
  </a>
</p>

React Strapped provides mechanisms that make it straightforward to initialize React with runtime bootstrap data in multi-page applications. React Strapped is intentionally small with no runtime dependencies.

- [Motivation](#motivation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Multi-page Apps](#multi-page-apps)
- [Frequently Asked Questions](#frequently-asked-questions)
  - [Is it possible to reset bootstrap data?](#is-it-possible-to-reset-bootstrap-data)
  - [Can I reuse root atoms across different bootstrap roots?](#can-i-reuse-root-atoms-across-different-bootstrap-roots)
  - [Is Recoil Bootstrap server side rendering friendly?](#is-recoil-bootstrap-server-side-rendering-friendly)
  - [Is Recoil Bootstrap React Server Components friendly?](#is-recoil-bootstrap-react-server-components-friendly)
- [API Specification](#api-specification)
  - [`rootAtom(key)`](#rootatomkey)
  - [`bootstrappedAtom(rootAtom, options)`](#bootstrappedatomrootatom-options)
  - [`bootstrappedAtomValueHook(bootstrappedAtom)`](#bootstrappedatomvaluehookbootstrappedatom)
  - [`<BootstrapRoot bootstrapData={} rootAtom={}>...</BootstrapRoot>`](#bootstraproot-bootstrapdata-rootatombootstraproot)
- [License](#license)

## Motivation

React has a number of popular state management libraries, such as [Redux](https://react-redux.js.org/), [Zustand](https://github.com/pmndrs/zustand) [Jotai](https://jotai.org/), and [Recoil](https://recoiljs.org/). While each of these state management libraries brings their own opinions to state management, none of them have opinions on how to load bootstrap data. As we'll see later, this creates friction for developing modern applications.

Popular frameworks such as [Next.js](https://nextjs.org/) have given rise to what I call client-side multi-page applications. These applications blur the line between traditional multi-page applications (MPAs) and single-page applications (SPAs). Specifically, they inherit the routing and separation of concerns of traditional MPAs and combine it with client-side routing of SPAs.

While I'm a big fan of client-side MPAs, I've always struggled with bootstrap data that's generated during server side rendering (SSR). Bootstrap data in client-side MPAs typically have the following characteristics:
- Some data is always available on all pages.
    - Examples include: data about the current user, feature/experimentation flags, etc.
    - This data is always available, and can be consumed "no questions asked."
    - In Next.js, this data is typically populated via a centralized helper function that is called from [`getServerSideProps`](getServerSideProps).
- Other data is only available on certain pages.
    - Examples include settings information that's only available on a settings page, but not on the home page.
    - This data is _not_ available on all pages, and so care must be take to only access this data on the settings page.
    - In Next.js, this data is typically populated via one-off code in a specific page(s) [`getServerSideProps`](getServerSideProps) implementation.
- Bootstrap data is not available until the first render of the application.
    - In Next.js, bootstrap data generated in [`getServerSideProps`](getServerSideProps) is passed as component properties to the top level component.
    - The implication of this pattern is that any state management declared at module scope, such as `atom()` constructors in Jotai and Recoil, do not have access to this data at time of construction.
    - This limitation means we can't use typical state initialization techniques for these state management libraries.
- Data during SSR needs to be scoped to a React context and not be available globally.
    - A Next.js server is rendering multiple requests from multiple users more or less at once, meaning global data is not an option since it wouldn't be "scoped" to a specific user.
    - While it's possible to use global data safely in Next.js applications, it's _very_ tricky to completely prevent all data "leaks" at all times. As such, I think it's best to avoid as a whole.
     - This means we can't do tricks for Jotai/Recoil like creating a global promise we attach to each atom's initializer, and then resolving it once we get the bootstrap data.

Taking these characteristics into account when considering state management libraries, we end up with these requirements for state management:
1. Initialize the store/atoms/etc. synchronously during the first render
2. Allow global data to be used anywhere, but prevent page specific data from being used outside of that page
3. Only load state management code on a page if they are used on that page

Redux/Zustand handle requirement 1. well. Jotai/Recoil handle 1. and 3. well, but only if we're not trying to solve 2 (see https://github.com/nebrius/recoil-bootstrap#motivation for a more in-depth explanation why). None of these four handle 2. well.

React Strapped exists to handle all 3 points well. That said, React Strapped is _not_ a replacement for the four state management libraries mentioned, and is indeed intended to be used in conjunction with them. See [Linking to other state management libraries](#linking-to-other-state-management-libraries) for more information.

_Aside:_ This project grew out of [recoil-bootstrap](https://github.com/nebrius/recoil-bootstrap), a previous library I created to solve this problem with Recoil, because 1) I realized that the problem recoil-bootstrap solved isn't limited to Recoil and 2) Meta appears to have stopped investing in Recoil.

## Installation

Install React Strapped from npm with:

```
npm install react-strapped
```

## Getting Started

React Strapped works by creating a React context to hold bootstrap data, and special hooks for accessing this data. We call an instance of provider+hooks associated with a piece of bootstrap data a "strap." Unlike other state management libraries, these contexts are intentionally designed so that more than one can be used at a time and with each other. We'll see this in action in the next section.

### Simple example

This example shows a minimal example using React Strapped. It's written in TypeScript to a) demonstrate how TypeScript types flows through the library and b) to give a sense of what data is expected where. You can absolutely use this library without using TypeScript though.

First, let's create our provider in a file called `state.ts`:

```tsx
import { createStrappedProvider } from 'react-strapped';

export interface MyBootstrapData {
  currentUser: {
    name: string;
    age: number;
  };
}

// First, we create the strap, which includes the context provider and some helper functions for creating hooks
const myStrap = createStrap<MyBootstrapData>();

// Next, export the provider to make data available to components
export const MyStrapProvider = myStrap.Provider;

// Finally create a hook for accessing the current user included in the bootstrap data
export const useCurrentUser = myStrap.createUseStrappedValue(({currentUser}) => currentUser);
```

Now let's create some UI in a Next.js page component:

```tsx
import type { MyBootstrapData } from './state';
import { MyStrapProvider, useCurrentUser } from './state';

interface PageProps {
  bootstrapData: MyBootstrapData;
}

// If you're not familiar with Next.js, this function runs on a server and is
// responsible for fetching bootstrap data. The value of the `props` property is
// passed as props to the default export React component in this file.
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
    // We include our strap provider and give it the bootstrap data. This
    // initializes data and make it immediately available for use via strap
    // hooks, e.g. `useCurrentUser`
    <MyStrapProvider bootstrapData={bootstrapData}>
      <MyComponent />
    </MyStrapProvider>
  );
}

function MyComponent() {
  // We use the hook created above, which makes sure that we're calling this
  // hook in a component with <MyStrapProvider> as a parent in the component tree
  const currentUser = useCurrentUser();
  return (
    // Prints "Hello Philip J Fry"
    <div>Hello {currentUser.name}</div>
  );
}
```

### Multi-page Apps

Recoil Bootstrap is designed specifically for client-side multi-page applications, which React Straps supports via multiple `<BootstrapRoot>` components. You can have as many bootstrap roots as you want with any amount of nesting.

In multi-page applications, we often have a set of bootstrap data that is common to all pages as well as bootstrap data that is specific to a page. With Recoil Bootstrap, you can create one bootstrap root for the common bootstrap data that exists on all pages, and then per-page bootstrap roots that contain those pages' data.

This would look like:

```tsx
function AppWrapper({ commonBootstrapData, children }) {
  return (
    <RecoilRoot>
      <BootstrapRoot
        bootstrapData={commonBootstrapData}
        rootAtom={commonRootAtom}
      >
        {children}
      </BootstrapRoot>
    </RecoilRoot>
  );
}

export default function MyPage({ commonBootstrapData, myPageBootstrapData }) {
  return (
    <AppWrapper commonBootstrapData={commonBootstrapData}>
      <BootstrapRoot
        bootstrapData={myPageBootstrapData}
        rootAtom={myPageRootAtom}
      >
      </BootstrapRoot>
    </AppWrapper>
  )
}
```

If bootstrap data exists across a few pages, you can create a third bootstrap root that is shared between these pages.

When using multiple roots, hooks for accessing data provide guardrails against accessing data from the wrong place. If you try and call a bootstrapped hook based on `myPageRootAtom` on a different page, then you'll get a human readable error saying you're trying to access it from the wrong place, like so:

<br />
<p align="center">
  <img src="img/access-error.png" width="480" alt="Image showing a hook access error" />
</p>

For an in-depth example of a multi-page Next.js app using Recoil Bootstrap, see my [recoil-prototyping](https://github.com/nebrius/recoil-prototyping) repository.

### Updating strap data after first render

## Frequently Asked Questions

### Is it possible to reset bootstrap data?

Not currently, but it's on the roadmap. See https://github.com/nebrius/recoil-bootstrap/issues/1 for more information.

### Can I reuse root atoms across different bootstrap roots?

No. When this happens, the last bootstrap root to be initialized will win, and any previous initialization data will be discarded. In addition, once I get support for resetting bootstrap data implemented, this could break client-side routing because one of the roots could be unmounted while the other is still mounted. This would cause the bootstrapped atom to be put back in a loading state and would start throwing exceptions in the still-mounted bootstrap root component tree.

### Is Recoil Bootstrap server side rendering friendly?

Yes. Initialization happens synchronously, so all data will be available for the single rendering pass that happens in server side rendering.

### Is Recoil Bootstrap React Server Components friendly?

Yes, ish. Recoil Bootstrap works just fine with React Server Components. Each server component that fetches bootstrap data can be assigned its own `<BootstrapRoot>` to contain that component tree's bootstrap data.

The catch is that hooks cannot be used inside of React Server Components, meaning that Recoil can only be used in client-only components. As such, Recoil Bootstrap is also limited to client-only components.

## Linking to other state management libraries

### Jotai

### Others

For now

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

The root atom to be passed to a corresponding [BootstrapRoot](#BootstrapRoot) component.

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

A function to initialize the bootstrapped atom with. This function is called at runtime with all of the bootstrap data passed to [BootstrapRoot](#BootstrapRoot). The atom's value is then set to the value returned from this function.

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

Calling the hook returned from this function in the wrong scope will throw an exception. "Wrong scope" is defined as calling this hook in a component that does not have the correct corresponding `BootstrapRoot` further up the component tree as a parent of this component.

### `<BootstrapRoot bootstrapData={} rootAtom={}>...</BootstrapRoot>`

This component initializes the supplied root atom and its associated bootstrapped atoms with the supplied bootstrap data.

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

The root atom to store the bootstrap data, which in turn initializes all bootstrapped atoms associated with it.

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

[getServerSideProps]: https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props
