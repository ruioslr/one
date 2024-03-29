import FreezeView from '@/components/FreezeView';
import useCreation from '@/hooks/useCreation';
import useTabModel, { getNowKeys } from '@/models/useTabModel';
import { FC, memo, ReactNode, useEffect } from 'react';
import TabsView from '@/components/TabsView';
import { useOutlet } from 'react-router-dom';
import { history } from '@/utils';

import './index.less';
import ErrorBoundary from '@/components/ErrorBoundary';

export interface ITabRouteProps {
  user?: {
    user?: any;
    routeTree: any[];
    views: string[];
    routeList: any[];
    list: string[];
  };
  useTranslation?: any;
}

const useTabRoute = ({ user, useTranslation }: ITabRouteProps) => {
  const tabModel = useTabModel();

  const { tabMap, selectTab, closeTab, clearTab, removeOtherTab, addTab } = tabModel;
  const routeConfig = user?.routeList.find((v) => v.path === location.pathname);
  const page = useOutlet();
  const activeKey = routeConfig.samekeyWithUrl ? routeConfig.path : getNowKeys();

  // 如果加了samekeyWithUrl属性，但是点击菜单导致只跳转了path，没有search，则给它加上search
  if (
    routeConfig.samekeyWithUrl &&
    !location.search &&
    tabMap.current.get(routeConfig.path)?.location.search
  ) {
    history.push(
      routeConfig.path + tabMap.current.get(routeConfig.path)?.location.search,
      { replace: true },
    );
  }

  useCreation(() => {
    console.log(user?.routeList, 'list');
    user?.routeList?.forEach((v) => {
      if (v.alwayTag) {
        addTab({
          activeKey: v.path || '/dashboard',
          routeConfig: v,
          page: null,
        });
      }
    });
  }, [user]);
  // 如果有下级当前列表不展示tab
  if (routeConfig && !routeConfig.routes) {
    addTab({
      activeKey,
      routeConfig,
      page,
    });
  }

  // 重定向地址
  useEffect(() => {
    if (routeConfig?.routes) {
      history.push(routeConfig.redirect || routeConfig.routes[0].path || '/dashboard');
    }
  }, [routeConfig, history]);

  const tabs = [...tabMap.current.values()];

  return [
    <TabsView
      {...{ selectTab, closeTab, activeKey, clearTab, removeOtherTab, tabs }}
      useTranslation={useTranslation}
    />,
    <>
      {tabs.map(({ key, page, noCache }) => (
        <div
          key={key}
          className={`${activeKey === key ? 'show' : 'hide'}`}
          style={{ height: '100%' }}>
          {noCache ? (
            page
          ) : (
            <FreezeView freeze={activeKey !== key}>
              <ErrorBoundary>{page}</ErrorBoundary>
            </FreezeView>
          )}
        </div>
      ))}
    </>,
  ];
};

export default useTabRoute;
