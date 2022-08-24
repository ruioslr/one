import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface Config {
  size: SizeType;
  views?: string[];
  totalKey?: string;
}

let defaultConfig: Config = {
  size: 'small',
  views: [],
  totalKey: 'total',
};

const setConfig = (c: Partial<Config>) => {
  console.log(c, 'config ----- kutb ');
  defaultConfig = {
    ...defaultConfig,
    ...c,
  };
};

const getConfig = () => defaultConfig;

export { setConfig, getConfig };
