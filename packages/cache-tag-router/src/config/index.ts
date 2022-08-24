import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface Config {
  history: any;
}

let defaultConfig: Config = {
  history: null,
};

const setConfig = (c: Partial<Config>) => {
  defaultConfig = {
    ...defaultConfig,
    ...c,
  };
};

const getConfig = () => defaultConfig;

export { setConfig, getConfig };
