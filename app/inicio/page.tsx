'use client';

import CompanyBootstrap from '@/components/company/CompanyBootstrap';

// Depende de auth y del store persistido en localStorage: no hay nada útil
// que prerenderizar en build, y el prerender llegó a romper con
// `useCompanyStore.persist` undefined en ese entorno.
export const dynamic = 'force-dynamic';

const HomePage = () => {
  return <CompanyBootstrap />;
};

export default HomePage;