import { ReactNode } from 'react'
import { Capacitor } from '@capacitor/core'
import classNames from 'classnames'

interface ButtonsOnBottomProps {
  children: ReactNode
}

export default function ButtonsOnBottom({ children }: ButtonsOnBottomProps) {
  const classes = classNames(
    'flex flex-col gap-2 w-full mt-1',
    { 'mb-3': Capacitor.isNativePlatform() }
  )

  return <div className={classes}>{children}</div>
}
