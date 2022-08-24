import { useEffect, useRef, useState } from 'react';

const useTableTop = () => {
  // table距离顶部距离
  const [tableTop, setTableTop] = useState(0);
  const [rect, setRect] = useState<DOMRect>();
  // table顶部dev测量高度
  const placeholderDev = useRef<HTMLDivElement>(null);
  // 计算表格的高度;
  useEffect(() => {
    setTimeout(() => {
      const domRect = placeholderDev.current?.getBoundingClientRect()!;
      if (domRect?.top) {
        setTableTop(domRect.top);
        setRect(domRect);
      }
    }, 500);
  }, []);
  return { tableTop, placeholderDev, rect };
};
export default useTableTop;
