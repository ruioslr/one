import { useState } from 'react';

export type SelectionType<T> = {
  rows: T[];
  keys: string[];
};
const useSelection = <T>(rowKey: string) => {
  if (!rowKey) {
    console.warn('要使用Selection，需要table添加string类型的rowKey');
  }

  const [selections, setSelections] = useState<SelectionType<any>>({
    keys: [],
    rows: [],
  });

  // 表格check列表
  const rowSelection = {
    onSelect: (record: any, selected: boolean) => {
      let keys: string[] = [];
      let rows: T[] = [];
      if (selected) {
        keys = [...selections.keys, record[rowKey]];
        rows = [...selections.rows, record];
      } else {
        keys = selections.keys.filter((key) => key !== record[rowKey]);
        rows = selections.rows.filter((row: any) => row[rowKey] !== record[rowKey]);
      }
      setSelections({
        keys,
        rows,
      });
      console.log(keys);
    },
    onSelectAll: (selected: boolean, selectedRows: T[], changedRows: T[]) => {
      let keys: string[] = [];
      let rows: T[] = [];
      if (selected) {
        keys = [...selections.keys, ...changedRows.map((_: any) => _[rowKey])];
        rows = [...selections.rows, ...changedRows];
      } else {
        keys = selections.keys.filter(
          (key) => !changedRows.map((_: any) => _[rowKey]).includes(key),
        );
        rows = selections.rows.filter(
          (row: any) => !changedRows.map((_: any) => _[rowKey]).includes(row[rowKey]),
        );
      }
      setSelections({
        keys,
        rows,
      });
    },
    selectedRowKeys: selections.keys,
  };
  /**
   * @description: 清空选中
   */
  //
  const cleanSelection = () => {
    setSelections({ keys: [], rows: [] });
  };
  return {
    rowSelection,
    cleanSelection,
    selections,
  };
};
export default useSelection;
