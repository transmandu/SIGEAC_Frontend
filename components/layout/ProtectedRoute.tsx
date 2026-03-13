'use client'

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '../misc/LoadingPage';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  directPermissions?: string[];
}

const ProtectedRoute = ({
  children,
  roles,
  permissions,
  directPermissions,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const userRoles = user?.roles?.map((role) => role.name) || [];
  const userPermissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.name)
    ) || [];
  const userDirectPermissions =
    user?.permissions?.map((permission) => permission.name) || [];

  const shouldRedirectToLogin = !loading && !user;
  const isRoleAllowed = !roles || roles.some((role) => userRoles.includes(role));
  const isPermissionAllowed =
    !permissions ||
    permissions.some((permission) => userPermissions.includes(permission));
  const isDirectPermissionAllowed =
    !directPermissions ||
    directPermissions.some((permission) =>
      userDirectPermissions.includes(permission)
    );
  const shouldRedirectToNotAuthorized =
    !loading &&
    !!user &&
    (!isRoleAllowed || !isPermissionAllowed || !isDirectPermissionAllowed);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace('/login');
      return;
    }

    if (shouldRedirectToNotAuthorized) {
      router.replace('/not-authorized');
    }
  }, [router, shouldRedirectToLogin, shouldRedirectToNotAuthorized]);

  if (loading) return <LoadingPage />;
  if (shouldRedirectToLogin || shouldRedirectToNotAuthorized) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
