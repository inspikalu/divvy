'use client';

import React from 'react';
import { PagePanel } from '@/components/PagePanel';
import { DemoWalletsGuide } from '@/components/DemoWalletsGuide';

export default function DemoPage() {
  return (
    <PagePanel
      title="Demo Guide"
      subtitle="Funded devnet wallets for testing the claim flow, and the end-to-end demo script."
    >
      <DemoWalletsGuide />
    </PagePanel>
  );
}
