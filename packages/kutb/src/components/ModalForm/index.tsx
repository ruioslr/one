import { IKuFromInstance, KuFmGroup, KuForm, useKuForm } from '@elune/kufm';
import { Modal } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal/Modal';
import {
  forwardRef,
  ForwardRefRenderFunction,
  memo,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { IKuFmGroup } from '@elune/kufm/typings/types/group';

export interface ModalFormProps {
  show: boolean;
  onClose?: (input: any, cancle?: boolean) => void;
  formInit?: any;
  modalProps?: ModalFuncProps;
  needHiddeClean?: boolean;
  title?: ReactNode;
  topRender?: () => Element;
  bottomRender?: () => Element;
}
export interface ModalFormRef {
  form: IKuFromInstance;
}
const ModalForm: ForwardRefRenderFunction<
  ModalFormRef,
  ModalFormProps & Omit<IKuFmGroup, 'title'>
> = (
  {
    show,
    onClose,
    formInit = undefined,
    needHiddeClean = true,
    title = '' as ReactNode,
    modalProps,
    topRender,
    bottomRender,
    list,
    ...other
  },
  ref,
) => {
  const [loading, setLoading] = useState(false);
  const [form] = useKuForm();
  const formList = list;
  // const formRef = useRef<CommomFormRef | null>(null);
  useImperativeHandle(ref, () => ({ form }), [form]);
  // 监听show 来切换新的数据
  useEffect(() => {
    if (show) {
      setLoading(false);
    } else {
      needHiddeClean && form.resetFields();
    }
  }, [show, form, needHiddeClean]);
  useEffect(() => {
    if (formInit) {
      form.setFieldsValue(formInit, true);
      // formRef.current?.forcedUpdate();
    }
  }, [formInit, form]);
  const formView = useMemo(() => {
    return (
      <KuForm {...other} form={form}>
        <KuFmGroup list={formList} />
      </KuForm>
    );
  }, [form, formList, other]);

  return (
    <Modal
      title={title}
      visible={show}
      maskClosable={false}
      okText="确定"
      okButtonProps={{ disabled: other.disabled }}
      forceRender
      cancelText="取消"
      // afterClose={() => form.resetFields()}
      onOk={async () => {
        const values = await form.validateFields();
        setLoading(true);
        try {
          await onClose?.(values);
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        onClose?.(formInit, true);
      }}
      confirmLoading={loading}
      {...modalProps}>
      <>
        {topRender && topRender()}
        {formView}
        {bottomRender && bottomRender()}
      </>
    </Modal>
  );
};
export default memo(forwardRef(ModalForm));
