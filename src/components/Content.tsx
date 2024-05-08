import { ReactNode } from 'react'

interface ContentProps {
  children: ReactNode
}

export default function Content({ children }: ContentProps) {
  return <div className='w-full'>{children}</div>
}
