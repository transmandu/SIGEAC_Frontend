 'use client'

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '../misc/LoadingPage';

interface ProtectedLayoutProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}

const ProtectedLayout = ({ children, roles, permissions }: ProtectedLayoutProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const userRoles = user?.roles?.map((role) => role.name) || [];
  const userPermissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.name)
    ) || [];

  const shouldRedirectToLogin = !loading && !user;
  const shouldRedirectToNotAuthorized =
    !loading &&
    !!user &&
    ((roles && !roles.some((role) => userRoles.includes(role))) ||
      (permissions &&
        !permissions.some((permission) => userPermissions.includes(permission))));

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

export default ProtectedLayout;
