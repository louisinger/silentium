import { ReactNode } from 'react'

interface ColumnsProps {
  children: ReactNode
  cols?: number
}

export default function Columns({ children, cols }: ColumnsProps) {
  return <div className={`grid grid-cols-${cols ?? 2} gap-y-3 gap-x-3 px-0`}>{children}</div>
}
