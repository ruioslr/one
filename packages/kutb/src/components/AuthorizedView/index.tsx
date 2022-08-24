import { cloneElement, FC, memo } from 'react';
import { getConfig } from '../../config';

interface AuthorizedViewProps {
  auth?: string;
  children: any;
  noAuthDisabled?: boolean;
}
const AuthorizedView: FC<AuthorizedViewProps> = ({
  children,
  auth,
  noAuthDisabled = true,
}) => {
  const views = getConfig().views;

  const isHasPermission = auth ? views?.find((_) => _.trim() === auth.trim()) : true;
  if (isHasPermission) {
    return <>{children}</>;
  } else {
    if (noAuthDisabled) {
      return cloneElement(children, { disabled: true });
    } else {
      return <></>;
    }
  }
};
export default memo(AuthorizedView);
