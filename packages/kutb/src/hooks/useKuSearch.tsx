import { FC, ReactElement, useState } from 'react';
import {
  CommonObject,
  IKuFmField,
  IKuForm,
  IKuFromInstance,
  KuFmGroup,
  KuFmLayout,
  KuForm,
} from '@elune/kufm';
import { Button } from 'antd';
import { getConfig } from '../config';
import { IKuFmGroup } from '@elune/kufm/typings/types/group';

export interface IKuSearchParams {
  list: IKuFmField[];
  form: IKuFromInstance;
  onSearch?: (formValues: any) => Promise<any>;
  onClean?: () => Promise<void>;
  kufmProps?: Partial<IKuForm>;
  kufmGroupProps?: Partial<IKuFmGroup>;
  count?: number;
}

export interface IKuSearchOuter {
  loading: boolean;
}

const useKuSearch = ({
  list,
  form,
  onSearch,
  onClean,
  kufmProps,
  kufmGroupProps,
  count,
}: IKuSearchParams) => {
  const [loading, setLoading] = useState(false);

  const View = (
    <KuForm layout={KuFmLayout.INLINE} form={form} {...kufmProps}>
      <KuFmGroup list={list} className="row_wrap" count={count ?? 4} {...kufmGroupProps}>
        <div
          style={{
            display: 'inline-block',
            flex: 1,
            textAlign: 'start',
            verticalAlign: 'bottom',
            marginBottom: 8,
          }}>
          <Button
            type="primary"
            size={getConfig().size}
            onClick={async () => {
              try {
                setLoading(true);
                await onSearch?.(form.getFieldsValue());
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}>
            查询
          </Button>
          <Button
            size={getConfig().size}
            className="mL-8"
            onClick={async () => {
              try {
                setLoading(true);
                await onClean?.();
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}>
            重置
          </Button>
        </div>
      </KuFmGroup>
    </KuForm>
  );
  return [
    View,
    {
      loading,
    },
  ] as [ReactElement, IKuSearchOuter];
};

export { useKuSearch };
