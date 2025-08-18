import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingPage = () => {
  return (
    <div className='z-10 w-dvw h-dvh flex items-center justify-center'>
        <Loader2 className='size-20 animate-spin' />
    </div>
  )
}

export default LoadingPage
