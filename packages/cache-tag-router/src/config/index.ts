import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface Config {
  user: any;
}

let defaultConfig: Config = {
  user: null,
};

const setConfig = (c: Partial<Config>) => {
  defaultConfig = {
    ...defaultConfig,
    ...c,
  };
};

const getConfig = () => defaultConfig;

export { setConfig, getConfig };
