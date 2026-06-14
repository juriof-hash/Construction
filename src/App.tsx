/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeometryProvider } from './contexts/GeometryContext';
import { GeometryApp } from './components/GeometryApp';

export default function App() {
  return (
    <GeometryProvider>
      <GeometryApp />
    </GeometryProvider>
  );
}
