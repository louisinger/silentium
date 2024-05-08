import classNames from 'classnames'
import { ReactNode, useEffect, useState } from 'react'

interface OuterContainerProps {
  children: ReactNode
}

export default function OuterContainer({ children }: OuterContainerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const className = classNames(
    'xl:max-w-96 mx-auto h-full p-4 pb-2 flex flex-col',
    'transition duration-500 ease-in-out',
    { 'opacity-100': visible },
    { 'opacity-0': !visible }
  )


  return <div className={className}>{children}</div>
}
