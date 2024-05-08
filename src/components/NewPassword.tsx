import { useEffect, useState } from 'react'
import InputPassword from './InputPassword'

const calcStrength = (pass: string, max = 100): number => {
  let strength = pass.length * 5
  if (pass.match(/\d/)) strength += 10
  if (pass.match(/\W/)) strength += 10
  return strength < max ? strength : max
}

interface NewPasswordProps {
  setLabel: (label: string) => void
  onNewPassword: (password: string) => void
}

export default function NewPassword({ onNewPassword, setLabel }: NewPasswordProps) {
  const [confirm, setConfirm] = useState('')
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    onNewPassword(password === confirm ? password : '')
    if (!password) return setLabel("Can't be empty")
    if (password !== confirm) return setLabel('Passwords must match')
    setLabel('Save password')
  }, [password, confirm])

  const handleChangeInsert = (e: any) => {
    const pass = e.target.value
    setStrength(calcStrength(pass))
    setPassword(pass)
  }

  const handleChangeConfirm = (e: any) => setConfirm(e.target.value)

  return (
    <div className='pt-10'>
      <InputPassword onChange={handleChangeInsert} label='Password' />
      <div className='relative mb-16 mt-2 text-sm text-gray-500'>
        <div className='w-full bg-gray-200 rounded-full h-1.5 mb-4'>
          <div className='bg-gray-700 h-1.5 rounded-full' style={{ width: `${strength}%` }} />
        </div>
        <span className='absolute start-0 -bottom-6'>Weak</span>
        <span className='absolute start-1/2 -translate-x-1/2 -bottom-6'>Enough</span>
        <span className='absolute end-0 -bottom-6'>Strong</span>
      </div>
      <InputPassword onChange={handleChangeConfirm} label='Confirm password' />
    </div>
  )
}
