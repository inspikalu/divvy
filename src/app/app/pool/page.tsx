'use client';

import React from 'react';
import { PagePanel } from '@/components/PagePanel';
import { PoolOverview } from '@/components/PoolOverview';

export default function PoolPage() {
  return (
    <PagePanel
      title="Pools Directory & Details"
      subtitle="Explore and inspect all Meteora Dynamic Bonding Curve pools integrated with Divvy dividend routing."
    >
      <PoolOverview />
    </PagePanel>
  );
}
