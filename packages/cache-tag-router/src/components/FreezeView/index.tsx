import { FC, memo, Suspense, useEffect, useRef } from 'react';

interface IFreeze {
  freeze: boolean;
  children: React.ReactNode;
}
interface IFreezeView extends IFreeze {
  placeholder?: React.ReactNode;
}
interface ICache {
  promise?: Promise<void>;
  resolve?: (value: void | PromiseLike<void>) => void;
}
export const Freeze: FC<IFreezeView> = ({ freeze, children }) => {
  const promiseCache = useRef<ICache>({}).current;
  if (freeze && !promiseCache.promise) {
    promiseCache.promise = new Promise((resolve) => {
      promiseCache.resolve = resolve;
    });
    throw promiseCache.promise;
  } else if (freeze) {
    throw promiseCache.promise;
  } else if (promiseCache.promise) {
    promiseCache.resolve?.();
    promiseCache.promise = undefined;
  }

  return <>{children}</>;
};
const FreezeView: FC<IFreezeView> = ({ freeze, children, placeholder = null }) => {
  return (
    <Suspense fallback={placeholder}>
      <Freeze freeze={freeze}>{children}</Freeze>
    </Suspense>
  );
};
export default memo(FreezeView);
