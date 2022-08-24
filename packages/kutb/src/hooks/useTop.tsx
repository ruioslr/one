import { FC, Ref, useEffect, useRef, useState } from 'react';

interface IOut {
  loading: boolean;
  calculate: () => void;
  top: number;
  boundingClientRect?: DOMRect;
}

interface IComponent {
  className?: string;
}

const useTop = () => {
  const [loading, setLoading] = useState(true);
  const [top, setTop] = useState(0);
  const [boundingClientRect, setBoundingClientRect] = useState<DOMRect>();

  const ref = useRef<HTMLDivElement>(null);

  const calculate = () => {
    const boundingClientRect = ref.current?.getBoundingClientRect();

    setLoading(false);
    setTop(boundingClientRect!.top);
    setBoundingClientRect(boundingClientRect);
  };

  useEffect(() => {
    calculate();
  }, []);

  const Component = useRef<FC<IComponent>>(getComponent({ ref }));

  /*===OUT===*/
  const out: IOut = {
    loading,
    calculate,
    top,
    boundingClientRect,
  };

  /*===OUT===*/

  return [out, Component.current] as [IOut, FC<IComponent>];
};

const getComponent: (p: { ref: Ref<HTMLDivElement> }) => FC<IComponent> =
  ({ ref }) =>
  ({ children, className }) => {
    return (
      <div className={className} ref={ref}>
        {children}
      </div>
    );
  };

export default useTop;
