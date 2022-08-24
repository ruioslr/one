import useDidCancel from '../hooks/useDidCancel';
import { dateFormat } from '../utils';
import {
  Button,
  ButtonProps,
  Checkbox,
  Dropdown,
  Menu,
  Pagination,
  Popover,
  Spin,
  Tooltip,
} from 'antd';
import Table from '../components/ResizeColTable';
import { TablePaginationConfig } from 'antd/es/table/interface';
import { FilterValue } from 'antd/lib/table/interface';
import { IKuFmField, useKuForm } from '@elune/kufm';
import React, {
  FC,
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import AuthorizedView from '../components/AuthorizedView';
import useSelection from '../hooks/useSelection';
import useTableTop from '../hooks/useTableTop';
import './index.less';
import PageLocal from 'antd/es/locale/zh_CN';
import { getConfig } from '../config';

import {
  CommonTableRef,
  IActionBtnType,
  ICommonTableProps,
  TModalContent,
} from '../interface/types';
import { KuSearch } from '../components/KuSearch';
import useFilterColumn from '../hooks/useFilterColumn';
import { IAction, ModalView } from '../components/ModalView';
import { LoadingOutlined, MoreOutlined } from '@ant-design/icons';

export const PAGE_SIZE_OPTIONS = ['20', '50', '100'];

const CommonTable = <T extends {}>(
  props: ICommonTableProps<T>,
  ref: Ref<CommonTableRef>,
) => {
  const {
    pageSize: initPageSize = 20,
    columns: initColumns,
    disInitList,
    rowKey,
    operationList,
    dataFun,
    renderExplain,
    requestInterceptor,
    responseKey = 'list',
    totalKey = getConfig().totalKey || 'total',
    paginationSizeName = 'size',
    paginationCurrentName = 'page',
    showTotal,
    paginationProps,
    filterBundle,
    subtractHeight,
    noPagination,
    count,
    ...other
  } = props;
  const [form] = useKuForm();
  const { rowSelection, cleanSelection, selections } = useSelection<T>(
    props.rowKey as string,
  );
  const [columns, setColumns] = useState<typeof initColumns>(initColumns);
  // initColumns 变化后刷新
  useEffect(() => {
    console.log(initColumns, 'initColumns');
    setColumns(initColumns);
  }, [initColumns]);
  const { tableTop, placeholderDev, rect } = useTableTop();

  // 排序对象
  const sortObj = useRef<Record<string, number>>({});
  // 禁止卸载再次setState
  const [didCancel] = useDidCancel();
  // 数据源
  const [dataSource, setDataSource] = useState<T[]>([]);
  const total = useRef(0);
  const page = useRef(1);
  const pageSize = useRef(initPageSize);
  // 当前操作对象
  const currentColumn = useRef<T>();
  const currentCusModalContent = useRef<TModalContent<T>>();
  // 获取数据接口
  const getData = useCallback(async () => {
    if (!dataFun) return;

    let params;
    if (filterBundle) {
      params = {
        filter: {
          ...(form.getFieldsValue?.() || {}),
          size: pageSize.current,
          page: page.current,
        },
        order: sortObj.current,
      };
    } else {
      params = {
        ...(form.getFieldsValue?.() || {}),
        page_size: pageSize.current,
        page_num: page.current,
        order: sortObj.current,
      };
    }

    if (requestInterceptor) params = requestInterceptor(params);
    try {
      setTableLoading(true);

      const data: any = await dataFun(params);
      if (didCancel.current) return;
      const list = data[responseKey];
      total.current = data[totalKey];
      setDataSource(list);
    } finally {
      setTableLoading(false);
    }
  }, [form, didCancel, dataFun, requestInterceptor]);
  /**
   * @description: 刷新
   */
  const onRefresh = useCallback(async () => {
    page.current = 1;
    await getData();
  }, [getData]);

  useImperativeHandle(ref, () => ({ onRefresh, getData, list: dataSource }), [
    onRefresh,
    getData,
    dataSource,
  ]);
  /**
   * @description: 初始化列表
   */
  useEffect(() => {
    if (!disInitList) getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disInitList]);

  // -------- 新的renderFilterColumn ----------

  const renderFilterColumn = useFilterColumn({
    initColumns,
    setColumns,
  });

  // ++++++++++ 新的renderFilterColumn ++++++++++

  const dealColumns = (columns: typeof initColumns) => {
    const dealedColumns = columns
      ?.filter((v) => v.dataIndex)
      .map(({ btnList, columnType, isEllipsis, onClick, auth, ...other }) => {
        const props = { ...other };
        if (btnList || columnType === 'time') {
          props.render = (data, record) => {
            if (columnType === 'time') {
              return dateFormat(data);
            }
            return <>{btnList?.map((v, index) => getActionBtn(v, index, record))}</>;
          };
        }
        if (isEllipsis) {
          props.ellipsis = { showTitle: false };
        }
        return {
          ...props,
          render: (...args: any[]) => {
            const children = (() => {
              if (props.render) {
                // @ts-ignore
                return props.render(...args);
              } else if (onClick) {
                return (
                  <AuthorizedView auth={auth}>
                    <TooltipCom args={args} onClick={onClick} />
                  </AuthorizedView>
                );
              } else {
                return args[0] || '--';
              }
            })();

            // 有onClick 则不需要再包Tooltip了
            if (onClick) {
              return children;
            }

            return isEllipsis || typeof children === 'string' ? (
              <Tooltip placement="top" title={children}>
                <div className={'ellipise'}>{children}</div>
              </Tooltip>
            ) : (
              children
            );
          },
        };
      });

    console.log(dealedColumns, JSON.stringify(columns), 'dealedColumns');
    return dealedColumns;
  };

  /**
   * @description: 切换页面
   */
  const onPageChange = useCallback(
    (pageNum: number, size: number | undefined) => {
      // cleanSelection();
      page.current = pageNum;
      pageSize.current = size || initPageSize;
      getData();
    },
    [getData, initPageSize, cleanSelection],
  );

  /**
   * @description: 排序支持
   */
  const onTableChange = (
    _: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: any,
  ) => {
    if (sorter.order) {
      sortObj.current = {
        [sorter.field]: sorter.order === 'ascend' ? 1 : 0,
      };
    } else {
      sortObj.current = {};
    }

    getData();
  };

  // 过滤数据
  const filterList = useMemo(() => {
    return initColumns
      .filter((v) => v.field && !v.disFilter)
      .map(({ hiddenLabel, dataIndex, title, label, name, props, ...other }) => ({
        ...other,
        props: {
          ...props,
          onKeyDown: ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
            if (key === 'Enter' && other.field === 'input') {
              getData();
            }
          },
        },
        required: false,
        label: hiddenLabel ? '' : label || title,
        name: name || dataIndex,
      })) as IKuFmField[];
  }, [getData, initColumns]);

  // 重置搜索
  const onClean = async () => {
    form.resetFields();
    await onRefresh();
  };
  const hasSelection = operationList?.some((v) => v.isSelection);

  /**
   * @description: action按钮
   */
  const getActionBtn = useCallback(
    (
      {
        action,
        text,
        onBtnClick,
        auth,
        disabled,
        isFilter,
        dontNeedCustomField,
        group,
        ...btnOther
      }: IActionBtnType<T>,
      index: number | string,
      record: any,
    ) => {
      const isDisable = typeof disabled === 'function' ? disabled(record) : disabled;

      const { isEdit, isTableForm } = action ?? {};

      let { content } = action ?? {};

      if (isFilter) {
        return (
          <Popover
            placement="bottomLeft"
            key={index}
            title={'自定义列表'}
            content={renderFilterColumn(dontNeedCustomField)}
            trigger="click">
            <Button {...btnOther} disabled={isDisable} size={getConfig().size}>
              {text instanceof Function ? text(record) : text}
            </Button>
          </Popover>
        );
      }

      // 处理btnGroup
      if (group) {
        const menu = () => {
          return (
            <Menu>
              {group.map((item, i) => (
                <Menu.Item key={i}>
                  {getActionBtn(item, `${index}-${i}`, record)}
                </Menu.Item>
              ))}
            </Menu>
          );
        };

        return (
          <Dropdown overlay={menu} trigger={['hover']}>
            <MoreOutlined style={{ cursor: 'pointer' }} />
          </Dropdown>
        );
      }

      /*      // 处理异步content: 直接在这里处理，因为可以实现btn的loading;
      // 同时，ModalView也是支持异步content的，但是没法在弹窗弹出之前给btn Loading,
      // 因为 点击btn后，弹窗就会出来，没法做到，点击后，异步执行content后，再弹窗
      if (content instanceof Function) {
        // 利用onBtnClick 实现loading，会造成content优先级高于onBtnClick
        // 异步content
        onBtnClick = async (data, onRefresh) => {
          const Com = (content as Function)(record);
          if (Object.prototype.toString.call(Com) === '[object Promise]') {
            content = await Com;
          } else {
            content = Com;
          }
        };
      }*/

      if (onBtnClick) {
        // 有btnClick则只处理点击事件
        return (
          <AuthorizedView key={index} auth={!isDisable ? auth : ''}>
            <LoadingButton
              size={getConfig().size}
              {...btnOther}
              disabled={isDisable}
              onClick={async () => await onBtnClick?.(record, onRefresh)}>
              {text instanceof Function ? text(record) : text}
            </LoadingButton>
          </AuthorizedView>
        );
      }

      const ModalViewAction = {
        ...action,
        afterOk: (record?: any) => {
          // 处理needRefresh
          if (!action?.needRefresh) return;
          if (action.needRefresh === 'current') {
            getData();
          } else {
            onRefresh();
          }
        },
        commitFun: async (formValues: any, record: any) => {
          if (action?.commitFun) {
            await action?.commitFun({
              formValues,
              record,
              selections: selections as any,
              cleanSelection,
              getData,
              onRefresh,
            });
          }
        },
      };

      // 处理isTableForm, 生成formList
      if (isTableForm) {
        ModalViewAction.formList = initColumns
          .filter((v) => v.isEdit && (isEdit ? !v.editHidden : true))
          .map(
            ({ hiddenLabel, dataIndex, title, label, name, editDisabled, ...other }) => ({
              label: label || title,
              name: name || dataIndex,
              disabled: isEdit ? editDisabled : false,
              ...other,
            }),
          ) as IKuFmField[];
      }

      return (
        <AuthorizedView key={index} auth={!isDisable ? auth : ''}>
          <ModalView action={ModalViewAction as IAction} originData={record}>
            {({ contentLoading }) => (
              <Button
                loading={contentLoading}
                size={getConfig().size}
                {...btnOther}
                disabled={isDisable}>
                {text instanceof Function ? text(record) : text}
              </Button>
            )}
          </ModalView>
        </AuthorizedView>
      );
    },
    [selections, initColumns, renderFilterColumn, getData, onRefresh, cleanSelection],
  );

  const [tableLoading, setTableLoading] = useState(false);

  const container = useRef<HTMLDivElement>(null);

  const renderTable = (loading: boolean) => {
    //tableTop还没出来则不渲染table
    if (tableTop === 0) {
      return (
        <Spin
          style={{ marginTop: 150, width: '100%', textAlign: 'center' }}
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          spinning={true}
        />
      );
    }

    return (
      <>
        <Table
          tableRealWidth={rect?.width}
          loading={loading || tableLoading}
          columns={dealColumns(columns)}
          dataSource={dataSource}
          onChange={onTableChange}
          rowKey={rowKey}
          pagination={false}
          size={getConfig().size}
          {...other}
          scroll={{
            ...other.scroll,
            y: `calc(100vh - ${tableTop || 120}px - ${subtractHeight || 100}px )`,
          }}
          rowSelection={
            hasSelection ? { ...rowSelection, ...props.rowSelection } : undefined
          }
        />
        {!noPagination && (
          <div className={'paginationContainer'}>
            <Pagination
              locale={PageLocal.Pagination}
              current={page.current}
              total={total.current}
              showQuickJumper
              pageSize={pageSize.current}
              onChange={onPageChange}
              className={'pagination'}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              showTotal={
                (showTotal &&
                  ((total: number, range: any) =>
                    selections.keys.length
                      ? `已选择${selections.keys.length}条 | 共${total}条`
                      : `共${total}条`)) as any
              }
              size={getConfig().size as any}
              showSizeChanger
              {...paginationProps}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={container} className={`kutb column`}>
      {/* 顶部过滤  */}
      <KuSearch
        list={filterList}
        form={form}
        onSearch={onRefresh as any}
        count={count}
        onClean={onClean as any}>
        {({ loading }) => {
          return (
            <>
              {/* 顶部操作按钮 */}
              {operationList && operationList.length > 0 && (
                <>
                  {operationList.map(({ isSelection, ...other }, index) =>
                    getActionBtn(
                      {
                        ...other,
                        className: 'mR-10',
                        disabled: () =>
                          Boolean(isSelection && selections.keys.length <= 0),
                      },
                      index,
                      {
                        selections: selections,
                      },
                    ),
                  )}
                </>
              )}
              {renderExplain?.(getData)}
              <div ref={placeholderDev} className="mT-10" />
              {columns && renderTable(loading)}
            </>
          );
        }}
      </KuSearch>
    </div>
  );
};

export default forwardRef(CommonTable) as <T>(
  props: ICommonTableProps<T> & { ref?: Ref<CommonTableRef> },
) => ReactElement;

const LoadingButton: FC<ButtonProps> = (props) => {
  const { children, onClick } = props;

  const [loading, setLoading] = useState(false);

  const newClick = async (e: any) => {
    try {
      setLoading(true);
      await onClick?.(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button {...props} loading={loading} onClick={newClick}>
      {children}
    </Button>
  );
};

// 点击之后关闭的tooltip
const TooltipCom = ({ args, onClick }: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      trigger={'hover'}
      visible={visible}
      onVisibleChange={setVisible}
      placement="top"
      title={args[0]}>
      <a
        className={'ellipise'}
        onClick={() => {
          // 关闭tooltip
          setVisible(false);
          setTimeout(() => {
            onClick(args[1]);
          }, 120);
        }}>
        {args[0]}
      </a>
    </Tooltip>
  );
};
