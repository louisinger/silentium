import { ReactNode } from 'react'

interface ButtonsOnBottomProps {
  children: ReactNode
}

export default function ButtonsOnBottom({ children }: ButtonsOnBottomProps) {
  return <div className='flex flex-col gap-2 w-full mt-1'>{children}</div>
}
