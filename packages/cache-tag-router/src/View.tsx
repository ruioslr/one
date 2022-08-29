import { getConfig } from '@/config';
import { FC, useEffect } from 'react';
import { RouterConfig } from '@/interface/types';
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { generateRoute, history, watermark } from './utils';

interface IProps {
  show?: boolean;
  routeTree?: any;
  frontRoute?: RouterConfig[];
  needWatermark?: boolean;
}

const View: FC<IProps> = ({ show, routeTree, frontRoute, needWatermark = true }) => {
  const user = getConfig().user;

  useEffect(() => {
    if (needWatermark && user?.user) {
      console.log(user, 'user');
      watermark({ watermark_txt: user?.user?.email });
    }
  }, [user]);

  return (
    <HistoryRouter history={history}>
      <Routes>
        {frontRoute?.map((_) => (
          <Route path={_.path} key={_.path} element={_.Component} />
        ))}
        {show && (routeTree ?? user?.routeTree).map(generateRoute)}
      </Routes>
    </HistoryRouter>
  );
};

export default View;
