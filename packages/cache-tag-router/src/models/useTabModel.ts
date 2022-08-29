import usePersistFn from '@/hooks/usePersistFn';
import last from 'lodash/last';
import { ReactElement, useRef } from 'react';
import { createModel } from 'rmox';
import { getQueryVariable } from '@/utils';
import { RouterConfig } from '@/interface/types';
import { getConfig } from '@/config';

let TAB_NAME_KEY = 'tab_name';
export const getTabNameKey = () => TAB_NAME_KEY;
export const setTabNameKey = (s: string) => (TAB_NAME_KEY = s);

// tab_name 相同，也认为是同一个页面
const getReg = (variable: string) =>
  new RegExp('(^|&)' + variable + '=([^&]*)(&|$)', 'i');
export const getNowKeys = (isSameKeyWithURL?: boolean) =>
  isSameKeyWithURL
    ? location.pathname
    : location.pathname + location.search?.replace(getReg(TAB_NAME_KEY), '');

export interface TabProps extends RouterConfig {
  key: string;
  page: ReactElement | null;
  location: Location;
}
export interface ITabInfo {
  activeKey: string;
  routeConfig: RouterConfig;
  page: ReactElement | null;
}
const useTabModel = () => {
  const { history } = getConfig();

  const tabMap = useRef(new Map<string, TabProps>());
  /**
   * @description: 关闭tab
   * @param {string} selectKey 关闭的key 默认当前
   * @param {string} path 关闭并跳转的地址
   */
  const closeTab = usePersistFn((selectKey = getNowKeys(), path?: string) => {
    if (tabMap.current.size >= 1) {
      const selectTab = tabMap.current.get(selectKey);
      tabMap.current.delete(selectKey);

      // 如果删除的是当前激活的tab，则激活上一个tab
      const lastTab = last([...tabMap.current.values()]);
      history.push(
        path ??
          (getNowKeys(selectTab?.samekeyWithUrl) === selectKey && lastTab
            ? lastTab.location.href
            : getNowKeys()),
        { replace: true },
      );
    }
  });
  // 添加标签
  const addTab = usePersistFn(({ activeKey, routeConfig, page }: ITabInfo) => {
    // 删除不缓存的页面
    [...tabMap.current.values()].forEach(({ key, noCache }) => {
      const tab = tabMap.current.get(key);
      if (noCache && tab) {
        tab.page = null;
      }
    });
    const tab = tabMap.current.get(activeKey);
    const tabName =
      routeConfig.path === location.pathname && getQueryVariable(TAB_NAME_KEY);
    const newTab = {
      ...routeConfig,
      key: activeKey,
      page,
      location: { ...location },
      tagName: tabName ? `-${tabName}` : '',
    };
    // 存在则替换
    if (tab) {
      // 如果有samekeyWithUrl,则什么都不做，使用之前的page
      if (routeConfig.samekeyWithUrl) {
        tabMap.current.set(activeKey, {
          ...newTab,
          // location: tab.location, // 用原来的location
          page: tab.page ?? page,
        });
        console.log(tabMap.current.get(activeKey), 'location');
        return;
      }

      if (tab.location.pathname !== location.pathname || !tab.page) {
        tabMap.current.set(activeKey, newTab);
      }
    } else {
      tabMap.current.set(activeKey, newTab);
    }
  });
  // 选中标签
  const selectTab = usePersistFn((selectTab: TabProps) => {
    history.push(selectTab.location.pathname + selectTab.location.search, {
      replace: true,
    });
  });

  // 清空标签
  const clearTab = usePersistFn(() => {
    [...tabMap.current.values()].forEach(({ key, alwayTag }) => {
      if (!alwayTag) tabMap.current.delete(key);
    });
    const lastTab = last([...tabMap.current.values()]);
    if (lastTab) history.push(lastTab.key, { replace: true });
  });
  // 删除其他标签
  const removeOtherTab = usePersistFn((selectKey: string) => {
    const nowMap = new Map();
    [...tabMap.current.values()].forEach((v) => {
      if (v.alwayTag) nowMap.set(v.key, v);
    });
    nowMap.set(selectKey, tabMap.current.get(selectKey));
    tabMap.current = nowMap;
    history.push(selectKey, { replace: true });
  });
  return { tabMap, addTab, closeTab, selectTab, clearTab, removeOtherTab };
};

export default createModel(useTabModel, { global: true });
