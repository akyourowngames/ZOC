'use client';

import { DaemonProvider } from '@/components/daemon/DaemonProvider';
import { StoreProvider } from '@/lib/store';
import { TrackerApp } from '@/components/TrackerApp';

export default function Home() {
  return (
    <StoreProvider>
      <DaemonProvider>
        <TrackerApp />
      </DaemonProvider>
    </StoreProvider>
  );
}
