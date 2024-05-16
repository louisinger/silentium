import classNames from 'classnames'
import { ReactElement } from 'react'

interface ButtonProps {
  disabled?: boolean
  icon?: ReactElement
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  secondary?: boolean
  progress?: number
  iconBtn?: boolean
}

export default function Button({ disabled, icon, label, onClick, secondary, progress, iconBtn }: ButtonProps) {
  const contentClass = classNames('flex justify-center items-center', {
    'mx-8 py-3': !iconBtn,
    'ml-2': iconBtn,
  })

  const fillerClass = classNames('z-2 relative bg-primary h-2 rounded-md w-full transition-all duration-300 ease-in-out mb-0', {
    'animate-pulse': progress !== undefined,
  })

  return (
      <button
        className={classNames(
          'mt-0 font-semibold rounded-md w-full disabled:opacity-40 disabled:border-none border hover:shadow-sm',
          { 'bg-gray dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700': secondary },
          { 'bg-gray-900 text-primary border-gray-200 dark:border-primary': !secondary },
          { 'cursor-not-allowed': disabled },
          { 'h-12 w-12 border-none dark:text-gray-100': iconBtn }
        )}
        disabled={disabled}
        onClick={onClick}
        type='button'
      >
      {progress !== undefined && <div className={fillerClass} style={{ width: `${progress}%` }} />}
        <div className={contentClass}>
          {icon ?? null}
          {!iconBtn && label}
        </div>
      </button>
  )
}
