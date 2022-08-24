import { ModalFormRef } from '../components/ModalForm';
import { IKuFmField } from '@elune/kufm';
import { ReactNode, useRef, useState } from 'react';
import { CommitFunTyp } from '../interface/types';

const useTableModal = <T>() => {
  // modal loading
  const [modalSpining, setModalSpining] = useState(false);
  // 弹窗结束请求
  const modalEndAction = useRef<CommitFunTyp<T> | undefined>();
  // 弹窗form配置
  const modalFormList = useRef<IKuFmField[]>([]);
  const modalRef = useRef<ModalFormRef>(null);
  // 显示弹窗
  const [showModal, setShowModal] = useState<{ show: boolean; title: ReactNode }>({
    show: false,
    title: '',
  });
  const [showCusModal, setShowCusModal] = useState(false);
  return {
    modalSpining,
    modalEndAction,
    modalFormList,
    modalRef,
    setModalSpining,
    showCusModal,
    setShowCusModal,
    showModal,
    setShowModal,
  };
};
export default useTableModal;
