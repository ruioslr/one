import { useCallback, useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { ResizeCallbackData } from 'react-resizable';
import { ResizableTitle } from '../components/ResizableTitle';

/*
 *  用于实现antd table 的列宽拖动
 */

type DataType = {
  [record: string]: string;
};

const useResizeColumn = ({ columns: originColumn }: any) => {
  const [columns, setColumns] = useState(originColumn);

  useEffect(() => {
    console.log(originColumn, 'originColumn');
    setColumns(originColumn);
  }, [originColumn]);

  const handleResize =
    (index: number) =>
    (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const newColumns = [...columns];
      newColumns[index] = {
        ...newColumns[index],
        width: size.width,
      };
      setColumns(newColumns);
    };

  const mergeColumns: ColumnsType<DataType> = columns.map((col: any, index: number) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  return [ResizableTitle, mergeColumns];
};
export default useResizeColumn;
