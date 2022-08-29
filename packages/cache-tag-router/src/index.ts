import useTabModel, {
  setTabNameKey,
  getTabNameKey,
  getNowKeys,
} from './models/useTabModel';
import useTabRoute from './TagRoute';
import RouteView from './View';
import { history } from './utils';

export * from 'react-router-dom';

export {
  useTabRoute,
  useTabModel,
  setTabNameKey,
  getTabNameKey,
  getNowKeys,
  RouteView,
  history,
};
export * from './config';
