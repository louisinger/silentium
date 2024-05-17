import { useEffect, useState } from 'react'
import Input from './Input'
import Button from './Button'
import { readMnemonicFromStorage } from '../lib/storage'
import Modal from './Modal'
import LoadingIcon from '../icons/Loading'
import ErrorBox from './Error'
import UnlockIcon from '../icons/Unlock'

interface NeedsPasswordProps {
  title: string
  onClose?: () => void
  onMnemonic: (mnemonic: string) => void
}

export default function NeedsPassword({ title, onClose, onMnemonic }: NeedsPasswordProps) {
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState('')

  useEffect(() => {
    setTimeout(() => setOpen(true), 100)
  }, [])

  const handleChange = (e: any) => {
    setPass(e.target.value)
    setError('')
  }

  const handleClose = () => {
    setLoading(false)
    setOpen(false)
    if (onClose) onClose()
  }

  const handleProceed = async () => {
    setLoading(true)
    setDisabled(true)
    readMnemonicFromStorage(pass).then((m) => {
      if (m) {
        onMnemonic(m)
        setOpen(false)
      } else setError('Invalid password')
      setLoading(false)
    })
  }

  useEffect(() => {
    setDisabled(Boolean(error))
  }, [error])

  return (
    <Modal title={title} open={open} onClose={handleClose}>
      {loading ? (
        <LoadingIcon small />
      ) : (
        <div className='flex flex-col gap-4'>
          <ErrorBox error={Boolean(error)} text={error} />
          <Input label='Password' onChange={handleChange} type='password' />
          <Button icon={<UnlockIcon/>} label='Unlock' secondary onClick={handleProceed} disabled={disabled} />
        </div>
      )}
    </Modal>
  )
}
