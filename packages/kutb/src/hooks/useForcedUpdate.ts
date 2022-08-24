/*
 * @Author: 筱白
 * @Date: 2021-03-10 11:01:50
 * @LastEditors: 筱白
 * @LastEditTime: 2021-03-22 14:29:42
 * @Description: useForcedUpdate
 */
import { useState, useCallback, useMemo } from 'react';

export default function useForcedUpdate() {
  const [renderKey, setRenderKey] = useState(Math.random);
  const forcedUpdate = useCallback(() => setRenderKey(Math.random), []);

  return useMemo(() => ({ renderKey, forcedUpdate }), [renderKey, forcedUpdate]);
}
