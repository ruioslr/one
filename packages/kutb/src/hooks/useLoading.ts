import { useCallback, useState } from 'react';

/*
 * @Author: 筱白
 * @Date: 2021-02-05 16:24:16
 * @LastEditors: 筱白
 * @LastEditTime: 2021-03-29 13:08:05
 * @Description: loading hooks
 */
const useLoading = (init = false) => {
  const [loading, setLoading] = useState(init);
  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);
  const hiddenLoading = useCallback(() => {
    setLoading(false);
  }, []);
  return {
    loading,
    startLoading,
    hiddenLoading,
  };
};
export default useLoading;
