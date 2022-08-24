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
