import React from 'react';

/**
 * @description: 获取search参数
 */
export const getQueryVariable = (variable: string) => {
  const reg = new RegExp('(^|&)' + variable + '=([^&]*)(&|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
};
