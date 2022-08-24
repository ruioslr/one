import ReactDOM from 'react-dom';
import { Button, Drawer, DrawerProps, Modal, ModalProps, Space, Spin } from 'antd';

import {
  PureComponent,
  cloneElement,
  ReactElement,
  ElementType,
  createRef,
  RefObject,
  Suspense,
} from 'react';
import { uuid } from './index';
import { getConfig } from '../config';

interface ModalWrapProps {
  id: string;
  close: Dialog['close'];
  closeAll: Dialog['closeAll'];
  modalOrDrawerProps?: ModalProps | DrawerProps;
  componentProps?: any; // 传给组件的propss
  children: ReactElement;
  type: 'modal' | 'drawer';
}

type GenericFunction = (...params: any[]) => any;

export interface DialogInjectProps {
  close: () => void;
  closeAll: Dialog['closeAll'];
  registerOk: (fun: Function) => void;
  registerCancel: (fun: GenericFunction) => void;
}

class ModalWrap extends PureComponent<ModalWrapProps> {
  state = {
    visible: false, // 代理visible, 以后可以代理onOk
    confirmLoading: false,
  };

  // 这样做让drawer也有弹出动画
  componentDidMount() {
    setTimeout(() => {
      this.setState({ visible: true });
    }, 50);
  }

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  show = () => {
    this.setState({
      visible: true,
    });
  };

  onOk: Function | null = null;
  onCancel: GenericFunction | null = null;

  registerCancel = (fun: GenericFunction) => {
    this.onCancel = fun;
  };

  registerOk = (fun: Function) => {
    this.onOk = fun;
  };

  render() {
    const children = (
      <Suspense
        fallback={
          <Spin
            style={{
              marginTop: 150,
              paddingBottom: 150,
              width: '100%',
              textAlign: 'center',
            }}
            spinning={true}
          />
        }>
        {cloneElement(this.props.children as ReactElement, {
          close: () => {
            this.props.close(this);
            this.onCancel?.();
          },
          closeAll: this.props.closeAll,
          registerOk: this.registerOk,
          registerCancel: this.registerCancel,
          ...this.props.componentProps,
        })}
      </Suspense>
    );

    if (this.props.type === 'modal') {
      return (
        <Modal
          visible={this.state.visible}
          onCancel={() => {
            this.props.close(this);
            this.onCancel?.();
          }}
          confirmLoading={this.state.confirmLoading}
          maskClosable={false}
          okButtonProps={{ size: getConfig().size }}
          cancelButtonProps={{ size: getConfig().size }}
          okText={'确定'}
          cancelText={'取消'}
          onOk={async () => {
            this.setState({ confirmLoading: true });
            try {
              await this.onOk?.();
              this.setState({ visible: false });
            } finally {
              this.setState({ confirmLoading: false });
            }
          }}
          {...this.props.modalOrDrawerProps}>
          {children}
        </Modal>
      );
    } else {
      return (
        <Drawer
          visible={this.state.visible}
          onClose={() => {
            this.props.close(this);
            this.onCancel?.();
          }}
          headerStyle={{ padding: '5px 20px' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size={getConfig().size}
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.props.close(this);
                  this.onCancel?.();
                }}>
                取消
              </Button>
              <Button
                loading={this.state.confirmLoading}
                type="primary"
                size={getConfig().size}
                onClick={async () => {
                  this.setState({ confirmLoading: true });
                  try {
                    await this.onOk?.();
                    this.setState({ visible: false });
                  } finally {
                    this.setState({ confirmLoading: false });
                  }
                }}>
                确定
              </Button>
            </div>
          }
          maskClosable={false}
          {...this.props.modalOrDrawerProps}>
          {children}
        </Drawer>
      );
    }
  }
}

// 一个modal对应一个div
class Dialog {
  modalWrapDomMap: Map<string, { dom: HTMLElement; ref: RefObject<ModalWrap> }> =
    new Map();

  open = (component: ElementType | string, props?: any, modalProps?: ModalProps) => {
    if (typeof component === 'string') {
      // import(`../dialogs/${component}`).then(({ default: Component }) => {
      //   console.log(Component);
      //   this.insertToDom(Component, props, modalProps);
      // });
      console.warn('dialog 弹出string现在还未支持！');
    } else {
      this.insertToDom(component, props, 'modal', modalProps);
    }
  };

  openModal = (component: ElementType | string, props?: any, modalProps?: ModalProps) => {
    this.open(component, props, modalProps);
  };

  openDrawer = (
    component: ElementType | string,
    props?: any,
    drawerProps?: DrawerProps,
  ) => {
    if (typeof component === 'string') {
      // import(`../dialogs/${component}`).then(({ default: Component }) => {
      //   console.log(Component);
      //   this.insertToDom(Component, props, modalProps);
      // });
      console.warn('dialog 弹出string现在还未支持！');
    } else {
      this.insertToDom(component, props, 'drawer', drawerProps);
    }
  };

  insertToDom = (
    Component: ElementType,
    props: any,
    type: 'modal' | 'drawer',
    modalOrDrawerProps?: ModalProps | DrawerProps,
  ) => {
    const id = uuid();
    console.log(id);
    const div = document.createElement('div');
    document.body.appendChild(div);

    const modalWrapRef = createRef<ModalWrap>();

    const modalWrap = (
      <ModalWrap
        type={type}
        id={id}
        close={this.close}
        componentProps={props}
        ref={modalWrapRef}
        closeAll={this.closeAll}
        modalOrDrawerProps={modalOrDrawerProps}>
        {/* @ts-ignore */}
        <Component />
      </ModalWrap>
    );
    this.modalWrapDomMap.set(id, { dom: div, ref: modalWrapRef });

    ReactDOM.render(modalWrap, div);
  };

  close = (modalWrapInstance: ModalWrap) => {
    modalWrapInstance.hide();
    const id = modalWrapInstance.props.id;
    setTimeout(() => {
      const div = this.modalWrapDomMap.get(id)?.dom;
      if (div) {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
      }
      this.modalWrapDomMap.delete(id);
    }, 200);
  };

  closeAll = () => {
    this.modalWrapDomMap.forEach(({ dom, ref }) => {
      if (ref.current) {
        this.close(ref.current);
      }
    });
  };
}

export default new Dialog();
