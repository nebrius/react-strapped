import React from 'react';

import { MyApp } from './app';
import type { MyBootstrapData } from './state';

async function getBootstrapData(): Promise<MyBootstrapData> {
  // Pretend this is an API call to a backend
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    currentUser: {
      name: 'Philip J Fry',
      age: 1_026,
    },
  };
}

// This is a React Server Component that fetches bootstrap data and passes it
// to our client component that initializes Recoil
export async function MyIndex() {
  const bootstrapData = await getBootstrapData();
  return <MyApp bootstrapData={bootstrapData} />;
}
