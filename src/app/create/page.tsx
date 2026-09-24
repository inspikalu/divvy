'use client';

import React from 'react';
import { PagePanel } from '@/components/PagePanel';
import { CreatorPanel } from '@/components/CreatorPanel';
import { useDivvyProtocol } from '@/hooks/useDivvyProtocol';

export default function CreatePage() {
  const metrics = useDivvyProtocol();

  return (
    <PagePanel
      title="Creator Studio"
      subtitle="Configure Divvy on your Meteora DBC token and route a share of trading fees to your holders."
    >
      <CreatorPanel metrics={metrics} />
    </PagePanel>
  );
}
