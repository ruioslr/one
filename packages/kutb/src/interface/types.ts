import { ReactElement, ReactNode, Key, ComponentType } from 'react';
import { FieldOption, IKuFmField } from '@elune/kufm';
import { ButtonProps, DrawerProps, ModalProps, PaginationProps, TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { SelectionType } from '../hooks/useSelection';

// 全局Form实例
export type InternalNamePath = (string | number)[];
export type NamePath = string | number | InternalNamePath;
export interface ISource {
  value: string | number;
  label: string;
}
export type CommontTypes = string | number | object;
export type OptionsTypes = {
  value: Exclude<CommontTypes, object>;
  label: Exclude<CommontTypes, object>;
};

export type CommonObject = Record<string, any>;

export type PluginType = 'field';

export type IExtraProps = {
  disabled?: boolean;
  sources?: ISource[];
};

export type FieldPlugin = {
  dependency?: IFieldKuFmDependency[];
};

export type RegisterFieldData = {
  ele: ReactElement;
  valueProps: string;
};
export type RegisterFieldPlugin = (
  pluginName: string,
  field: (config: FieldPlugin) => RegisterFieldData,
) => void;
export type OutPutType = string | number | Record<string, any> | IOptions[] | boolean;
export interface IFieldKuFmDependency {
  type: FieldOption; // 初始化不处理值关联防止覆盖的错误
  relates: NamePath[];
  output?:
    | OutPutType
    | ((form: CommonObject, dependsValues: any[]) => Promise<OutPutType>); //如果匹配到输出的值(value 或者 options)
  relateFun?: (ctx: any, value: any[], name: NamePath) => boolean | Promise<boolean>;
}

export interface IFieldDependencyMap {
  dependency: IFieldKuFmDependency[];
  names: NamePath[];
  name: NamePath;
}

// 数据源
export interface IOptions {
  value: string | number | boolean;
  label: string;
  [key: string]: any;
}

export interface ICommonTableProps<T = any> extends TableProps<T> {
  showCra?: boolean; // 是否显示添加按钮
  showTotal?: boolean; // 分页是否显示总数
  responseKey?: string; // 后端返回的数据用的名字
  totalKey?: string; // 后端返回的总数的名字
  dataFun?: (params?: any) => Promise<PageList<T>>; // 获取数据接口
  columns: CommonColumnsType<T>[];
  disInitList?: boolean; // 关闭默认请求 可能存在直接refresh
  rowKey?: string | (() => string);
  pageSize?: number; // 每页个数
  requestInterceptor?: (params?: any) => any;
  renderExplain?: (getData?: () => void) => Element;
  // 顶部操作按钮
  operationList?: IActionBtnType<T>[];
  paginationProps?: PaginationProps; // 分页组件的props
  paginationSizeName?: string; // 请求时传给后端的分页参数名
  paginationCurrentName?: string; // 请求时传给后端的当前页面参数名
  filterBundle?: boolean; // 是否需要把 getData 的请求参数 封在一个filter对象里（魔方需要）
  subtractHeight?: number; // table高度的减去值
  noPagination?: boolean; // 不显示分页
  count?: number; // filterForm的每行数
}

// column配置(包含筛选列) ==================
export type CommonColumnsType<T> = ColumnType<T> & {
  columnType?: 'time'; // 列类型(方便快捷显示)
  isEdit?: boolean; // 是否可编辑
  editHidden?: boolean; // 编辑时是否隐藏
  editDisabled?: boolean; // 编辑时是否禁用
  auth?: string; // 权限
  onClick?: (data: T) => void; // 支持点击
  btnList?: IActionBtnType<T>[]; // 按钮列表主要在操作栏
  isEllipsis?: boolean; // 是否超过一行tooltoip
  disFilter?: boolean; // 取消过滤
  isCustomColumn?: boolean; // 是否是自定义列，如果是，则默认不会再表单中显示
  alwaysInTable?: boolean; // 列是否可以被隐藏， true 则常驻table
} & Partial<IKuFmField>;

export interface PageList<T> {
  total: number;
  list: T[];
}

////// 过滤器==================

export type CommitFunParams<T = any> = {
  record: T;
  getData: () => void;
  onRefresh: () => void;
  cleanSelection: () => void;
  selections: {
    rows: T[];
    keys: Key[];
  };
  formValues?: any;
};

export type CommitFunTyp<T = any> = (params: CommitFunParams<T>) => Promise<unknown>;

export type Content = (
  p: any,
  other?: { close?: () => void; closeAll?: () => void },
) =>
  | (
      | Promise<ReactNode>
      | ReactNode
      | Promise<(other?: { close?: () => void; closeAll?: () => void }) => ReactNode>
    )
  | ReactNode;

export interface IActionBtnType<T> extends Omit<ButtonProps, 'disabled'> {
  action?: {
    mode: 'modal' | 'dialog' | 'drawer'; // modal 与 dialog 样式
    beforeAction?: (data: CommitFunParams<T>) => Promise<boolean>;
    title: ((data: T) => ReactNode) | ReactNode; // 标题
    isEdit?: boolean; // 是否为编辑模式
    content: Content;

    component?: ComponentType; // 直接由dialog.open调用
    conclusion?: string; // 请求完结束语
    commitFun?: CommitFunTyp<T>; // 提交方法
    initFun?: (data: T) => Promise<object>; // 初始化modal数据方法
    formList?: IKuFmField[];
    needRefresh?: boolean | 'current'; // 提交完是否需要刷新 current 刷新本页
    modalProps?: Partial<ModalProps>;
    drawerProps?: Partial<DrawerProps>;
    isTableForm?: boolean; // 按钮是否弹出基于table的form
  };
  disabled?: ((data: T) => boolean) | boolean;
  auth?: string;
  text?: string | ((data: T) => ReactNode); // 按钮内容
  onBtnClick?: (data: T, refresh: () => void) => Promise<void> | void; // 如果自定义点击不弹出modal和dialog按钮点击
  isSelection?: boolean; // 是否需要check
  isFilter?: boolean; // 是否是筛选列的按钮
  dontNeedCustomField?: boolean; //筛选列的窗口是否不需要自定义字段模块
  group?: IActionBtnType<T>[];
}

// 操作按钮
export type TModalContent<T> = {
  content: ((record: T) => Promise<ReactNode>) | ReactNode; // 选择modal时自定义modal内容
  onOk?: () => void;
} & ModalProps;

export interface CommonTableRef {
  getData: () => void;
  onRefresh: () => void;
  list: any[];
}
