import {
  ComponentType,
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
  Suspense,
} from 'react';
import dialog, { DialogInjectProps } from '../../utils/dialog';
import { ModalWarring } from '../../utils';
import { DrawerProps, message, ModalProps, Spin } from 'antd';
import { IKuFmField, KuFmGroup, KuForm, useKuForm } from '@elune/kufm';
import { CommitFunParams, TModalContent } from '../../interface/types';
import { getConfig } from '../../config';

export interface IAction {
  mode: 'modal' | 'dialog'; // modal 与 dialog 样式
  title: ((record?: any) => ReactNode) | ReactNode; // 标题
  beforeAction?: (data: CommitFunParams) => Promise<boolean>;

  content:
    | ((
        p: any,
        other?: { close?: () => void; closeAll?: () => void },
      ) => (Promise<ReactNode> | ReactNode) | ReactNode)
    | ReactNode;
  component?: ComponentType;
  componentProps?: any; // 给componet的属性
  conclusion?: string; // 请求完结束语
  // commitFun?: CommitFunTyp<any>; // 提交方法
  commitFun?: (data?: any, record?: any) => void;
  initFun?: (record?: any) => Promise<object>; // 初始化modal数据方法
  formList?: IKuFmField[];
  afterOk?: (record?: any) => void;
  modalProps?: Partial<ModalProps>;
  drawerProps?: Partial<DrawerProps>;

  isEdit?: boolean; // 是否为编辑模式
}

export interface Props<T> {
  originData?: any; // 给弹窗的初始数据
  action: IAction;
  disabled?: ((record: T) => boolean) | boolean; // 这个disable 只是用来处理弹窗是否可以弹出
  // auth?: string; 权限应该由children来处理
  children:
    | ReactElement
    | ((p: {
        store: any;
        setStore: (s: any) => void;
        contentLoading: boolean;
      }) => ReactElement);
}

const ModalView: FC<Props<any>> = (props) => {
  const { children, action, disabled, originData } = props;

  // 没有action
  if (!action) return <></>;

  const {
    mode,
    title,
    component,
    commitFun,
    conclusion,
    afterOk,
    formList,
    componentProps,
    modalProps,
    drawerProps,
    content,
    beforeAction,
  } = action;
  const titleNode = title instanceof Function ? title(originData) : title;

  const isDisable = typeof disabled === 'function' ? disabled(originData) : disabled;

  const dealDialog = () => {
    const contentNode = content instanceof Function ? content(originData) : content;

    ModalWarring(titleNode, contentNode, async () => {
      try {
        await commitFun?.();
        if (conclusion) {
          message.success(conclusion);
        }
        afterOk?.(originData);
      } catch (error) {
        console.log(error);
      }
    });
  };

  const dealModalOrDrawer = () => {
    const isModal = mode === 'modal';

    const dialogFun = dialog[isModal ? 'open' : 'openDrawer'];
    const modalOrDialogProps = isModal ? modalProps : drawerProps;
    /*
     * component： 直接使用dialog弹出， 配合componentProps,modalProps使用
     *
     * formList： 弹出kufm表单
     *
     * content: 也是弹出Dialog, 配合commitFun 使用，老代码的ModalContent应该改成这个，并将老代码的ModalContent.onOk 改成commitFun
     */

    if (component) {
      dialogFun(
        component,
        { componentProps, ...action },
        {
          title: titleNode,
          ...modalOrDialogProps,
        },
      );
      return;
    }

    // 有contentNode则直接弹出contentNode，没有则看有没有formList
    if (content) {
      const Component: FC<DialogInjectProps & { contentNode: ReactElement }> = ({
        registerOk,
        contentNode,
        close,
        closeAll,
      }) => {
        registerOk(async () => {
          await commitFun?.({}, originData);
          afterOk?.(originData);
        });

        return contentNode;
      };

      const dialogProps = {
        title: titleNode,
        okText: '确定',
        cancelText: '取消',
        ...modalOrDialogProps,
      };

      if (content instanceof Function) {
        const Com = content(originData);

        // 异步content
        if (Object.prototype.toString.call(Com) === '[object Promise]') {
          setContentLoading(true);
          (Com as Promise<ReactNode>)
            .then((res) => {
              setContentLoading(false);

              // 异步content返回的是是方法，即： 需要close 和closeAll
              if (res instanceof Function) {
                const Comp: FC<DialogInjectProps> = ({ registerOk, close, closeAll }) => {
                  registerOk(async () => {
                    await commitFun?.({}, originData);
                    afterOk?.(originData);
                  });
                  return res({ close, closeAll });
                };
                dialogFun(Comp, {}, dialogProps);
                return;
              }

              // resolve后弹窗
              dialogFun(Component, { contentNode: res }, dialogProps);
            })
            .catch(() => {
              setContentLoading(false);
            });
        } else {
          // content是普通函数
          dialogFun(Component, { contentNode: Com }, dialogProps);
        }
      } else {
        // content不是函数
        dialogFun(Component, { contentNode: content }, dialogProps);
      }

      return;
    }

    if (formList) {
      dialogFun(
        KufmModalComponent,
        { ...props },
        { title: titleNode, okText: '确定', cancelText: '取消', ...modalOrDialogProps },
      );
    }
  };

  const onClick = async () => {
    if (isDisable) return;

    if (beforeAction && !(await beforeAction(originData))) {
      return;
    }

    if (mode === 'dialog') {
      dealDialog();
      return;
    }
    if (mode === 'modal' || mode === 'drawer') {
      dealModalOrDrawer();
      return;
    }
  };

  const [contentLoading, setContentLoading] = useState(false);
  const [store, setStore] = useState({}); // 用来存一些单个ModalView 需要存的state
  const realChildren =
    children instanceof Function
      ? children({ store, setStore, contentLoading })
      : children;

  return <span onClick={onClick}>{realChildren}</span>;
};

interface KufmModalComponentProps extends DialogInjectProps, Props<any> {}

const KufmModalComponent: FC<KufmModalComponentProps> = ({
  action: { commitFun, initFun, formList, conclusion, afterOk, isEdit },
  originData,
  registerOk,
}) => {
  const [form] = useKuForm();
  console.log(commitFun);

  registerOk(async () => {
    await form.validateFields();
    await commitFun?.(form.getFieldsValue(), originData);
    if (conclusion) {
      message.success(conclusion);
    }
    afterOk?.();
  });

  // 初始化
  useEffect(() => {
    if (initFun) {
      initFun(originData).then((data) => form.setFieldsValue(data, true));
    }
  }, []);

  return (
    <>
      <KuForm form={form} size={getConfig().size}>
        <KuFmGroup list={formList!} />
      </KuForm>
    </>
  );
};

export { ModalView };
