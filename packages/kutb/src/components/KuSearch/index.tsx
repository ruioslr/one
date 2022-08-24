import React, { cloneElement, FC, ReactElement, ReactNode } from 'react';
import { IKuSearchOuter, useKuSearch, IKuSearchParams } from '../../hooks/useKuSearch';

export interface IKuSearchProps extends IKuSearchParams {
  children: ReactElement | ((p: IKuSearchOuter) => ReactNode);
}

const KuSearch: FC<IKuSearchProps> = ({ children, ...useKuSearchProps }) => {
  if (React.isValidElement(children) && React.Children.count(children)) {
    console.error(
      '警告！！KuSearch 的Children是单节点， 若果有多个child，可使用函数子组件',
    );
    return children;
  }

  const [View, others] = useKuSearch(useKuSearchProps);
  const realChildren = React.isValidElement(children)
    ? cloneElement(children as ReactElement, others)
    : typeof children === 'function'
    ? (children(others) as (p: IKuSearchOuter) => ReactNode)
    : children;

  if (!useKuSearchProps?.list?.length) return realChildren as ReactElement;

  return (
    <>
      {View}
      {realChildren}
    </>
  );
};

export { KuSearch };
