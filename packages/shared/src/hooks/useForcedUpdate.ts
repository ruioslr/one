
import { useState, useCallback, useMemo } from 'react';

export default function useForcedUpdate() {
  const [renderKey, setRenderKey] = useState(Math.random);
  const forcedUpdate = useCallback(() => setRenderKey(Math.random), []);

  return useMemo(() => ({ renderKey, forcedUpdate }), [renderKey, forcedUpdate]);
}
