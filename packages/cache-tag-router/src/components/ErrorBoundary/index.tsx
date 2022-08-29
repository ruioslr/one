import { Button, Result } from 'antd';
import React, { FC } from 'react';
import useTabModel from '@/models/useTabModel';

const Wrap: FC = ({ children }) => {
  const { closeTab } = useTabModel();

  return <ErrorBoundary closeTab={closeTab}>{children}</ErrorBoundary>;
};

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidMount() {
    console.log('mount');
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('errr');
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="系统出现异常"
          // subTitle="系统出现异常"
          extra={
            <Button
              type="primary"
              onClick={() => {
                this.props.closeTab(undefined, '/');
              }}>
              回到首页
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default Wrap;
