import resolve from '@rollup/plugin-node-resolve'; // 依赖引用插件
import commonjs from '@rollup/plugin-commonjs'; // commonjs模块转换插件
import packageJSON from './package.json';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import postcss from 'rollup-plugin-postcss';
import nested from 'postcss-nested';
import { babel } from '@rollup/plugin-babel';
import postcssPresetEnv from 'postcss-preset-env';
import simplevars from 'postcss-simple-vars';
import path from 'path';
import alias from '@rollup/plugin-alias';

import cssnano from 'cssnano';
const outConfig = {
  sourcemap: true,
  name: packageJSON.name,
  globals: {
    react: 'React',
    'react/jsx-runtime': 'jsxRuntime',
    'react-dom': 'ReactDOM',
  },
};

export default {
  input: 'src/index.ts',
  plugins: [
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    }),
    postcss({
      // use: [
      //   [
      //     'less',
      //     {
      //       javascriptEnabled: true,
      //       // modifyVars: {
      //       //   // 配置antd主题颜色
      //       //   'primary-color': '#52C9A0', // 主色
      //       //   'border-radius-base': '4px',
      //       //   'success-color': '#52C41A', // 成功色
      //       //   'warning-color': '#FAAD14', // 警告包
      //       //   'error-color': '#F5222D', // 错误色
      //       //   'body-background': '#FAFAFA', // 页面背影颜色
      //       //   // link coloe
      //       //   'link-color': '#52C9A0', // 链接的颜色
      //       //   'link-hover-color': '#5DDEB1', // 链接hover色
      //       //   'link-active-color': '#52C9A0', // 链接active色
      //       // },
      //     },
      //   ],
      // ],
      plugins: [simplevars(), nested(), postcssPresetEnv(), cssnano()],
      extensions: ['.css', '.less'],
      // extract: false,
    }),

    sizeSnapshot(),
    terser({
      compress: { drop_console: true },
    }),
    resolve({
      extensions: ['.ts', '.tsx'],
    }),
    commonjs(),
    // ts({ useTsconfigDeclarationDir: true }), // 编译代码但是不改扩展名
    babel({
      exclude: /^(.+\/)?node_modules\/.+$/, // 防止打包node_modules下的文件
      babelHelpers: 'runtime', // 使plugin-transform-runtime生效
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // skipPreflightCheck: true,
    }),
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@ant-design/icons',
    'antd',
    'rmox',
  ],
  output: [
    {
      file: 'lib/umd/index.js', // 通用模块
      format: 'umd',
      ...outConfig,
    },
    {
      file: 'lib/esm/index.js', // 通用模块
      format: 'esm',
      ...outConfig,
    },
    {
      file: 'lib/cjs/index.js', // 通用模块
      format: 'cjs',
      ...outConfig,
    },
  ],
};
