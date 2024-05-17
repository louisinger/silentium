import { useContext, useState } from 'react'
import Button from '../../../components/Button'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { FlowContext } from '../../../providers/flow'
import Title from '../../../components/Title'
import Content from '../../../components/Content'
import InputAmount from '../../../components/InputAmount'
import Container from '../../../components/Container'
import { WalletContext } from '../../../providers/wallet'
import { getBalance } from '../../../lib/wallet'
import InputAddress from '../../../components/InputAddress'
import Balance from '../../../components/Balance'
import { DUST_AMOUNT } from '../../../lib/coinSelection'

export default function SendAmount() {
  const { wallet } = useContext(WalletContext)
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)

  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')

  const updateAmount = (value: number) => {
    setError('')
    setAmount(value)

    if (value.toString().length <= 0 || value === 0) return
    const balance = getBalance(wallet)
    if (value < DUST_AMOUNT) {
      setError('amount is too low')
    }

    if (value >= balance) {
      setError('not enough funds')
      return
    }
  }

  const handleCancel = () => {
    setSendInfo({})
    navigate(Pages.Wallet)
  }

  const handleProceed = async () => {
    if (!sendInfo.address) return
    if (sendInfo.address) {
      setSendInfo({ ...sendInfo, satoshis: amount })
      navigate(Pages.SendDetails)
    }
  }

  const proceedEnabled = Boolean(!error && sendInfo.address && amount)

  return (
    <Container>
      <Content>
        <Balance value={getBalance(wallet)} />
        <hr className='my-4' />
        <Title text='Send' />
        <div className='flex flex-col gap-2'>
          <InputAddress label='Address' onChange={(address) => setSendInfo({ ...sendInfo, address })} />
          <InputAmount label='Amount' onChange={updateAmount} />
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button disabled={!proceedEnabled} onClick={handleProceed} label={error ? error : 'Proceed'} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
