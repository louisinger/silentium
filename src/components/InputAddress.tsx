import { useState } from 'react'
import Label from './Label'

const className = 'w-full p-3 pr-6 text-sm text-right font-semibold rounded-l-md -mr-4 bg-gray-100 dark:bg-gray-800 focus-visible:outline-none'

interface InputAmountProps {
  label: string
  onChange: (arg0: any) => void
}

export default function InputAddress({ label, onChange }: InputAmountProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  function validateAddress(address: string) {
    if (address.length < 26) {
      setError('Address too short')
    } else if (address.length > 35) {
      setError('Address too long')
    } else {
      setError('')
    }
  }

  return (
    <fieldset className='text-left text-gray-800 dark:text-gray-100 w-full'>
      {label ? <Label text={label} /> : null}
      <div className='flex items-center h-12 rounded-l-md bg-gray-100 dark:bg-gray-800'>
        <input 
            type='text'
            value={address}
            onChange={(e) => {
                setAddress(e.target.value)
                validateAddress(e.target.value)
                if (!error) onChange(e.target.value)
            }} 
            className={className} />
      </div>
      <div className='flex justify-between'>
        <p className='text-xs mb-2 sm:mb-4 sm:mt-2'>{error}</p>
      </div>
    </fieldset>
  )
}
