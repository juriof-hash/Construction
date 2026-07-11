/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { GeometryProvider } from './contexts/GeometryContext';
import { GeometryApp } from './components/GeometryApp';

export default function App() {
  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <GeometryProvider>
      <GeometryApp />
    </GeometryProvider>
  );
}
