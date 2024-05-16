import { useEffect, useState } from 'react'
import Label from './Label'
import Input from './Input'
import Button from './Button'
import ScanIcon from '../icons/Scan'
import BarcodeScannerModal from './BarcodeScannerModal'

interface InputAmountProps {
  label: string
  onChange: (arg0: any) => void
}

export default function InputAddress({ label, onChange }: InputAmountProps) {
  const [error, setError] = useState('')
  const [cameraAllowed, setCameraAllowed] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    navigator.permissions.query({ name: 'camera' as PermissionName }).then((x) => {
      if (x.state !== 'denied') setCameraAllowed(true)
    })
  })

  function validateAddress(address: string) {
    if (address.length < 26) {
      setError('Address too short')
    } else {
      setError('')
    }
  }

  function setInputValue(value: string) {
    if (showScanner) setShowScanner(false)
    validateAddress(value)
    setValue(value)
    if (!error) onChange(value)
  }

  return (
    <fieldset className='text-left text-gray-800 dark:text-gray-100 w-full'>
      <BarcodeScannerModal
         open={showScanner}
         setData={setInputValue}
         setError={setError}
         onClose={() => setShowScanner(false)} 
      /> 
      {label ? <Label text={label} /> : null}
      <div className='flex items-center h-12 rounded-l-md bg-gray-100 dark:bg-gray-800'>
        { cameraAllowed ? <Button iconBtn disabled={!cameraAllowed} onClick={() => setShowScanner(true)} label='' icon={<ScanIcon />} /> : null}
        <Input 
            type='text'
            onChange={(e) => setInputValue(e.target.value)}
            value={value}
          />
      </div>
      <div className='flex justify-between'>
        <p className='text-xs mb-2 sm:mb-4 sm:mt-2'>{error}</p>
      </div>
    </fieldset>
  )
}
