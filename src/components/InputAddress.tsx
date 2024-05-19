import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera } from '@capacitor/camera';

import Label from './Label'
import Input from './Input'
import Button from './Button'
import ScanIcon from '../icons/Scan'
import BarcodeScannerModal from './BarcodeScannerModal'
import classNames from 'classnames'
import { notify } from './Toast'

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
    if (Capacitor.isPluginAvailable('Camera')) {

      if (Capacitor.isNativePlatform()) {
        Camera.requestPermissions({
          permissions: ['camera']
        }).then((x) => {
          setCameraAllowed(x.camera === 'granted' ? true : false)
        })
        .catch((e) => {
          console.error(e)
          notify('Camera permission denied')
        })  
      } else {
        navigator.permissions.query({ name: 'camera' as PermissionName }).then((x) => {
          setCameraAllowed(x.state !== 'denied' ? true : false)
        })
        .catch((e) => {
          console.error(e)
          notify('Camera permission denied')
        })
      }
    }
  }, [])

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

      <div className='grid grid-cols-12 gap-0'>
        {cameraAllowed ? (
          <div className='h-12 col-span-2'>
            <Button
              iconBtn
              disabled={!cameraAllowed}
              onClick={() => setShowScanner(true)}
              label=''
              icon={<ScanIcon />}
            />
          </div>
        ) : null}
        <div className={classNames(
          'col-end-13 flex items-center h-12 rounded-l-md bg-gray-10',
          { 'col-span-10': cameraAllowed },
          { 'col-span-12': !cameraAllowed }
        )}>
          <Input type='text' onChange={(e) => setInputValue(e.target.value)} value={value} />
        </div>
      </div>
      <div className='flex justify-between'>
        <p className='text-xs mb-2 sm:mb-4 sm:mt-2'>{error}</p>
      </div>
    </fieldset>
  )
}
