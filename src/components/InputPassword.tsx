import { useState } from 'react'
import EyeOpenIcon from '../icons/EyeOpen'
import EyeClosedIcon from '../icons/EyeClosed'
import Label from './Label'

interface InputPasswordProps {
  label: string
  onChange: (arg0: any) => void
}

export default function InputPassword({ label, onChange }: InputPasswordProps) {
  const className = 'w-full p-3 text-sm font-semibold bg-gray-100 dark:bg-darklessgray focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-md'
  const [type, setType] = useState('password')

  const toggleVisibility = () => setType(type === 'text' ? 'password' : 'text')

  return (
    <form>
      {label ? <Label text={label} /> : null}
      <div className='flex items-center h-12 rounded-l-md bg-gray-100 dark:bg-gray-800'>
        <input
          autoComplete='new-password'
          className={className}
          onChange={onChange}
          type={type}
        />
        <div
          className='w-16 h-full flex items-center rounded-r-md text-sm bg-gray-700 dark:bg-gray-200 text-gray-100 dark:text-gray-800'
          onClick={toggleVisibility}
        >
          <div className='mx-auto'>{type === 'password' ? <EyeOpenIcon /> : <EyeClosedIcon />}</div>
        </div>
      </div>
    </form>
  )
}
