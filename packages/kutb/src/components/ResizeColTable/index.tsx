/*
 * antd table 添加列拖动宽度
 */

import { Spin, Table, TableProps } from 'antd';
import { FC, useEffect } from 'react';
import useResizeColumn from '../../hooks/useResizeColumn';
import useTableTop from '../../hooks/useTableTop';
import { LoadingOutlined } from '@ant-design/icons';

const ResizeColTable: FC<TableProps<any> & { tableRealWidth?: number }> = ({
  columns,
  tableRealWidth,
  ...others
}) => {
  if (!tableRealWidth) {
    return (
      <Spin
        style={{ marginTop: 150, width: '100%', textAlign: 'center' }}
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={true}
      />
    );
  }
  /* +++ resize Colum 相关 +++ */

  let totalWidth = 0;
  // column 添加默认宽度
  columns?.forEach((column) => {
    // @ts-ignore
    if (column.width === undefined && column.dataIndex) {
      column.width = 100;
    }
    totalWidth += column.width as number;
  });

  if (totalWidth < tableRealWidth!) {
    const step = (tableRealWidth - 8) / totalWidth;
    columns?.forEach((column) => {
      column.width = step * (column.width as number);
    });
  }

  const [ResizeTitle, resizeColumns] = useResizeColumn({ columns });

  /* --- resize Colum 相关 --- */

  return (
    <Table
      {...others}
      columns={resizeColumns as any}
      components={{
        ...others.components,
        header: {
          ...others.components?.header,
          cell: ResizeTitle as any,
        },
      }}
    />
  );
};

export default ResizeColTable;
