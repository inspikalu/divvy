'use client';

import React from 'react';
import { PagePanel } from '@/components/PagePanel';
import { PoolOverview } from '@/components/PoolOverview';

export default function PoolPage() {
  return (
    <PagePanel
      title="Pool Details"
      subtitle="The Meteora Dynamic Bonding Curve powering the meme token and its fee mechanics."
    >
      <div className="max-w-3xl">
        <PoolOverview />
      </div>
    </PagePanel>
  );
}
