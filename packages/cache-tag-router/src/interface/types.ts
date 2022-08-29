// 标签配置
export interface TabConfig {
  alwayTag?: boolean; // 是否一直存在
  url: string; // 跳转地址
  title?: string; // 标题
  activated?: boolean; // 是否当前显示
}
export type BreadConfig = {
  title: string;
  url?: string;
  path?: string;
};

export interface RouterConfig extends Pick<TabConfig, 'title' | 'alwayTag'> {
  path?: string; // 路径
  Component?: React.ComponentType; // 组件
  component?: React.ComponentType; // 组件
  tagName?: string; // 标签名称(详情使用)
  redirect?: string; // 重定向地址
  icon?: React.ReactElement | string; // 图标
  routes?: RouterConfig[]; // 多级路由
  hiddenMenu?: boolean; // 是否隐藏menu
  white?: boolean; // 白名单
  hiddenTab?: boolean; // 是否隐藏tag
  noCache?: boolean; // 不缓存页面
  breadList?: BreadConfig[];
  strict?: boolean;
  samekeyWithUrl?: boolean; // 是否直接拿path做key，即： search不同，也使用同一个page
}
