import FreezeView from '@/components/FreezeView';
import useCreation from '@/hooks/useCreation';
import useTabModel, { getNowKeys } from '@/models/useTabModel';
import { FC, memo, ReactNode, useEffect } from 'react';
import TabsView from '@/components/TabsView';
import { getConfig } from '@/config';
import { useOutlet } from 'react-router-dom';

import './index.less';

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
  const { history } = getConfig();

  const { tabMap, selectTab, closeTab, clearTab, removeOtherTab, addTab } = tabModel;
  const routeConfig = user?.routeList.find((v) => v.path === location.pathname);
  const page = useOutlet();
  const activeKey = routeConfig.samekeyWithUrl ? routeConfig.path : getNowKeys();
  console.log(activeKey, 'activcekey');
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
          {noCache ? page : <FreezeView freeze={activeKey !== key}>{page}</FreezeView>}
        </div>
      ))}
    </>,
  ];
};

export default useTabRoute;
