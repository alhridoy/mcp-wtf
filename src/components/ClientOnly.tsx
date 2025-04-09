'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // This useEffect only runs on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevents hydration errors and ensures the children
  // are only rendered on the client side
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
