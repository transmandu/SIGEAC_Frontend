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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      const userRoles = user.roles?.map(role => role.name) || [];
      const userPermissions = user.roles?.flatMap(role =>
        role.permissions.map(permission => permission.name)
      ) || [];

      if (roles && !roles.some(role => userRoles.includes(role))) {
        router.push('/not-authorized');
        return;
      }

      if (permissions && !permissions.some(permission => userPermissions.includes(permission))) {
        router.push('/not-authorized');
      }
    }
  }, [loading, user, roles, permissions, router]);

  if (loading) return <LoadingPage />;

  if (!user) return null;

  // Verificación final para asegurarnos que no redirigimos por error
  const finalUserRoles = user.roles?.map(role => role.name) || [];
  const finalUserPermissions = user.roles?.flatMap(role =>
    role.permissions.map(permission => permission.name)
  ) || [];

  if (roles && !roles.some(role => finalUserRoles.includes(role))) {
    return null;
  }

  if (permissions && !permissions.some(permission => finalUserPermissions.includes(permission))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedLayout;
