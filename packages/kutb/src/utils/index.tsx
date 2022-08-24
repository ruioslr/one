import React, { ReactNode } from 'react';
import Schema from 'async-validator';
import { IKuFmField } from '@elune/kufm';
import { CommonObject, NamePath } from '../interface/types';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import moment from 'moment';
import { ModalFuncProps } from 'antd/lib/modal/Modal';
import { Modal } from 'antd';

/**
 * @description: 获取对象的NamePath列列表
 * @param {CommonObject} data 原数据
 * @param {string} first  上一层keys
 * @return {*} 返回namepath列表
 */
const getObjNamePath = (data: CommonObject, first: string[] = []) => {
  let list: NamePath[] = [];
  Object.keys(data).forEach((v) => {
    const element = data[v];
    // 如果是数组拆分为对象与基础类型
    if (element instanceof Array) {
      element.forEach((ele, index) => {
        // 组装之前处理好的路径
        let paths = [...first, v, index];
        // 为对象的话继续递归
        if (typeof ele === 'object') {
          getObjNamePath(ele).forEach((e) => {
            if (e instanceof Array) {
              paths = [...paths, ...e];
            } else {
              paths.push(e);
            }
          });
          list.push([...paths]);
        } else {
          list.push(paths);
        }
      });
      // 如果为对象并且不为数组
    } else if (typeof element === 'object' && element) {
      list = [...list, ...getObjNamePath(element, [...(first ?? []), v])];
    } else {
      list.push(first ? ([...first, v] as NamePath) : v);
    }
  });
  return list;
};

const resetObj = (data: CommonObject) => {
  const realData: CommonObject = {};
  Object.keys(data).forEach((v) => {
    if (data[v] instanceof Object) {
      if (data[v] instanceof Array) {
        realData[v] = [];
        data[v].forEach((item: any, index: number) => {
          if (item instanceof Object) {
            realData[v][index] = resetObj(data[v][index]);
          } else {
            realData[v][index] = undefined;
          }
        });
      } else {
        realData[v] = resetObj(data[v]);
      }
    } else {
      realData[v] = undefined;
    }
  });
  return realData;
};

// const toArray = <T>(value?: T | T[] | null): T[] => {
//     if (value === undefined || value === null) {
//         return [];
//     }
//
//     return Array.isArray(value) ? value : [value];
// };
const isEmpty = (value: any) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (value instanceof Array && value.length === 0);

/**
 * @description: uuid
 */
const uuid = () => {
  const tempUrl = URL.createObjectURL(new Blob());
  const uuId = tempUrl.toString();
  URL.revokeObjectURL(tempUrl);
  return uuId.substr(uuId.lastIndexOf('/') + 1);
};
const validateRule = async (
  value: any,
  { required, label, rules }: IKuFmField,
  formStore: CommonObject,
) => {
  const uid = uuid();
  const validaterules = rules ? rules.map((rule) => ({ [uid]: rule })) : [];
  // @ts-ignore
  if (required instanceof Function ? required(formStore.current) : required) {
    validaterules.unshift({
      [uid]: {
        required: true,
        message: `${label ?? ''}不能为空`,
      },
    });
  }
  for (let i = 0; i < validaterules.length; i++) {
    const validator = new Schema(validaterules[i]);
    let result = [];
    try {
      const validateValue = { [uid]: value };
      await validator.validate(validateValue);
    } catch (e: any) {
      if (e.errors) {
        result = e.errors.map((c: { message: string }) => c.message);
      }
      return result[0];
    }
  }
  return '';
};

/**
 * @description: 时间格式化
 */
export const dateFormat = (time?: string | number, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '--';
  return moment(time).format(format);
};

/**
 * @description: 警告模态框
 */
export const ModalWarring = (
  title: ReactNode = '提示',
  content: ReactNode,
  onOk?: () => void,
  props?: ModalFuncProps,
) =>
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: '确认',
    cancelText: '取消',
    closable: true,
    onOk,
    ...props,
  });

export { uuid, isEmpty, resetObj, validateRule, getObjNamePath };
