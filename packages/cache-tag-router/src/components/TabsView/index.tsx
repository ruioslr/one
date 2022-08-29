import { TabProps } from '@/models/useTabModel';
import { CloseOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Tabs } from 'antd';
import TweenOneGroup from 'rc-tween-one/es/TweenOneGroup';
import { FC, Key, memo, MouseEvent } from 'react';
import './index.less';
interface TabsViewProps {
  tabs: TabProps[];
  closeTab: (key: string) => void;
  selectTab: (key: TabProps) => void;
  removeOtherTab: (key: string) => void;
  clearTab: () => void;
  activeKey: string;
  useTranslation?: any;
}
const TabsView: FC<TabsViewProps> = ({
  tabs,
  activeKey,
  closeTab,
  selectTab,
  removeOtherTab,
  clearTab,
  useTranslation,
}) => {
  if (!useTranslation) {
    useTranslation = () => ({
      t: (s: string) => s,
    });
  }

  const { t } = useTranslation();
  /**
   * @description: Tab关闭回调
   */
  const handleClose = (key: string) => (e: MouseEvent<HTMLElement>) => {
    console.log(key);
    e.stopPropagation();
    closeTab(key);
  };

  /**
   * @description: 点击Tab 执行切换路由操作
   */
  const handleChange = (tab: TabProps) => {
    selectTab(tab);
  };

  /**
   * @description: Menu点击执行(关闭,关闭其他,关闭所有)操作
   * @param {React} key menuKey
   * @param {TabConfig} Tab Tab实例
   */
  const onMenuClick = (key: Key, Tab: string) => {
    switch (key) {
      case '1':
        closeTab(Tab);
        break;
      case '2':
        removeOtherTab(Tab);
        break;
      case '3':
        clearTab();
        break;
    }
  };

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  /**
   * @description:  menu视图(标记:alwayTab 不可删除)
   * @param {TabConfig} Tab Tab实例
   * @return 返回Menu视图
   */
  const menu =
    (TabKey: string, alwayTab = false) =>
    () =>
      (
        // @ts-ignore
        <Menu onClick={(({ key }: any) => onMenuClick(key, TabKey)) as unknown as any}>
          {!alwayTab && <Menu.Item key="1">{t('close')}</Menu.Item>}
          <Menu.Item key="2">{t('closeOther')}</Menu.Item>
          <Menu.Item key="3">{t('closeAll')}</Menu.Item>
        </Menu>
      );
  return (
    <div className="cache-tag-tabs-view">
      <div className={'tabs_bg common_block_bg'}>
        <TweenOneGroup
          enter={{
            scale: 0.8,
            opacity: 0,
            type: 'from',
            duration: 100,
          }}
          appear={false}
          leave={{ opacity: 0, scale: 0, width: 0, duration: 200 }}
          className={'tabs_list'}>
          <Tabs activeKey={activeKey}>
            {tabs
              .filter((v) => !v.hiddenTab)
              .map((tab) => {
                const { key, title, alwayTag, tagName = '' } = tab;
                const activedStyle = activeKey === key ? 'tab_activity' : '';

                return (
                  <Tabs.TabPane
                    tab={
                      <div key={key}>
                        <Dropdown overlay={menu(key, alwayTag)} trigger={['contextMenu']}>
                          <div
                            className={`tab hover ${activedStyle} row_center`}
                            onClick={() => handleChange(tab)}>
                            <div className="tab-text">
                              {t(`${title}`)}
                              {tagName}
                            </div>
                            {!alwayTag && (
                              <CloseOutlined
                                className={`tab_close row_center`}
                                onClick={handleClose(key)}
                              />
                            )}
                          </div>
                        </Dropdown>
                      </div>
                    }
                    key={key}
                  />
                );
              })}
          </Tabs>
        </TweenOneGroup>
      </div>
    </div>
  );
};
export default memo(TabsView);
