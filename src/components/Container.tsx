import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
}

export default function Container({ children }: ContainerProps) {
  return <div className='flex flex-col h-full justify-between'>{children}</div>
}
