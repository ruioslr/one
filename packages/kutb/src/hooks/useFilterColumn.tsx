import { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Empty } from 'antd';
import { CommonColumnsType } from '../interface/types';
import '../kutb/index.less';

const CheckboxGroup = Checkbox.Group;

export interface IFilterColumn<T> {
  initColumns: CommonColumnsType<T>[];
  setColumns: (p: CommonColumnsType<T>[]) => void;
}

const useFilterColumn = <T extends {}>({ initColumns, setColumns }: IFilterColumn<T>) => {
  const haveDataIndexColumns = initColumns.filter((_) => _.dataIndex);
  const defaultColumns: CommonColumnsType<T>[] = haveDataIndexColumns.filter(
    (_) => !_.isCustomColumn,
  );
  const customColumns: CommonColumnsType<T>[] = haveDataIndexColumns.filter(
    (_) => _.isCustomColumn,
  );
  const [defaultCheckedList, setDefaultCheckedList] = useState<string[]>(
    defaultColumns.map((_) => _.title) as string[],
  );
  const [customCheckedList, setCustomCheckedList] = useState<string[]>(
    customColumns.filter((_) => _.alwaysInTable).map((_) => _.title) as string[],
  );

  // initColumns 发生变化后 更新defaultCheckedList，customCheckedList
  useEffect(() => {
    setDefaultCheckedList(defaultColumns.map((_) => _.title) as string[]);
    setCustomCheckedList(
      customColumns.filter((_) => _.alwaysInTable).map((_) => _.title) as string[],
    );
  }, [initColumns]);

  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  const onCheckChange = (list: string[], type: string) => {
    if (type === 'default') {
      setDefaultCheckedList(list);
    } else {
      setCustomCheckedList(list);
    }
  };

  // 全选的状态
  useEffect(() => {
    const isAllChecked =
      defaultCheckedList.length + customCheckedList.length ===
      haveDataIndexColumns.length;
    setIndeterminate(
      !!(defaultCheckedList.length || customCheckedList.length) && !isAllChecked,
    );
    setCheckAll(isAllChecked);
  }, [defaultCheckedList, customCheckedList, haveDataIndexColumns]);

  // 触发table列变化
  useEffect(() => {
    // 全部取消时，保留第一个不能被取消
    if (!defaultCheckedList.length && !customCheckedList.length) {
      setDefaultCheckedList([defaultColumns[0]?.title as string]);
      return;
    }

    setColumns(
      initColumns.filter(
        (_) =>
          defaultCheckedList.includes(_.title! as string) ||
          customCheckedList.includes(_.title! as string),
      ),
    );
  }, [defaultCheckedList, customCheckedList, initColumns]);

  const onCheckAllChange = useCallback(
    (e: any) => {
      const defaultAlwaysInTableColumns = defaultColumns.filter((_) => _.alwaysInTable);
      const customAlwaysInTableColumns = customColumns.filter((_) => _.alwaysInTable);

      setDefaultCheckedList(
        e.target.checked
          ? (defaultColumns.map((_) => _.title) as string[])
          : (defaultAlwaysInTableColumns.map((_) => _.title) as string[]),
      );
      setCustomCheckedList(
        e.target.checked
          ? (customColumns.map((_) => _.title) as string[])
          : (customAlwaysInTableColumns.map((_) => _.title) as string[]),
      );
    },
    [customColumns, defaultColumns],
  );

  const renderFilterColumn = useCallback(
    (dontNeedCustomField?: boolean) => {
      return (
        <div className={'filterColumns'}>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}>
            全部
          </Checkbox>
          <div className={'filterTitle'}>默认字段</div>
          <div className={'filterColumnsBox'}>
            <CheckboxGroup
              options={
                defaultColumns.map((_) => ({
                  label: _.title,
                  value: _.title,
                  disabled: _.alwaysInTable,
                })) as any
              }
              value={defaultCheckedList}
              onChange={(val) => onCheckChange(val as any, 'default')}
            />
          </div>
          {!dontNeedCustomField && (
            <>
              <div className={'filterTitle'}>自定义字段</div>
              <div className={'filterColumnsBox'}>
                <CheckboxGroup
                  options={
                    customColumns.map((_) => ({
                      label: _.title,
                      value: _.title,
                      disabled: _.alwaysInTable,
                    })) as any
                  }
                  value={customCheckedList}
                  onChange={(val) => onCheckChange(val as any, 'custom')}
                />
                {!customColumns.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              </div>
            </>
          )}
        </div>
      );
    },
    [
      checkAll,
      customCheckedList,
      customColumns,
      defaultCheckedList,
      defaultColumns,
      indeterminate,
      onCheckAllChange,
    ],
  );

  return renderFilterColumn;
};

export default useFilterColumn;
