/*
 * @Author: 筱白
 * @Date: 2021-04-20 10:12:58
 * @LastEditors: 筱白
 * @LastEditTime: 2021-04-20 10:25:03
 * @Description: 卸载hooks
 */
import { useEffect, useRef } from 'react';
const useDidCancel = () => {
  const didCancel = useRef(false);
  useEffect(() => {
    return () => {
      didCancel.current = true;
    };
  }, []);
  return [didCancel];
};

export default useDidCancel;
