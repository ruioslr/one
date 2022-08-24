import {FormInstance, SelectProps} from "antd";

export type CommonFormSelectProps = SelectProps<any> & CommonSelectProps;
export type OptionsTypes = {
  value: Exclude<CommontTypes, object>;
  label: Exclude<CommontTypes, object>;
  description?: string; // 描述
  children?: OptionsTypes[] | { [key: string]: OptionsTypes[] }; // 关联
  disabled?: boolean; // 子类是否可用
  render?: () => Element | JSX.Element; //自定右侧义布局
};

export type CommontTypes = string | number | object;

export type CommonSelectProps = {
  options?: OptionsTypes[]; // 列表
  disSearchRefresh?: boolean; // 禁止搜索刷新
  canFilter?: boolean; // 是否可模糊搜索当前列表
  form?: FormInstance;
  debounce?: number; // 远程搜索时间 默认为500
  initList?: boolean; // 初始化列表 默认为true
  valueKey?: string; // 需要额外对应的值的key
  render?: (data: any) => Element | JSX.Element;
  renderText?: (text: string | number) => string | number;
  searchFun?: (value: any, formValues: any[]) => Promise<any>; // 搜索方法
  onBackChangeFrom?: (value?: object, options?: any) => void; // 返回选中的值(返回value值给后端使用)
  relevance?: string | string[]; // select 关联对应select字段 关联子项目 (支持一对多关联)
  relevanceOptions?: (form: FormInstance<any>) => OptionsTypes[];
  showRefresh?: boolean; // 显示select刷新
  onRefreshHandler?: () => void; // 在刷新
  refreshClean?: boolean; // 刷新清空选择内容
  showDescription?: boolean; // 显示描述
  onOptionsChange?: (options?: OptionsTypes[]) => void;
  maxCount?: number;
  showMore?: boolean | 'label' | ((item: OptionsTypes) => React.ReactNode);
};
