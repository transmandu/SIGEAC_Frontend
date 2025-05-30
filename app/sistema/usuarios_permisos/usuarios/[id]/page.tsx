'use client'

import UserInfoCard from '@/components/cards/UserInfoCard'
import UserInfoTabs from '@/components/cards/UserInfoTabs'
import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useGetUserById } from '@/hooks/sistema/usuario/useGetUserById'

const UserByIdPage = ({ params }: { params: { id: string } }) => {

  const { data: user, error, isLoading } = useGetUserById(params.id);


  if (isLoading) {
    return <LoadingPage />
  }


  return (
    <ContentLayout title='USER PAGE'>
      <div className='flex flex-col gap-2 md:flex-row items-center justify-evenly'>
        <UserInfoCard user={user!} />
        <UserInfoTabs user={user!} />
      </div>
    </ContentLayout>
  )
}

export default UserByIdPage
