import { useContext, useState } from 'react'
import { NavigationContext, Pages } from '../../../providers/navigation'
import Container from '../../../components/Container'
import Content from '../../../components/Content'
import Title from '../../../components/Title'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import Button from '../../../components/Button'
import { WalletContext } from '../../../providers/wallet'
import { getP2TRAddress, getSilentPaymentAddress } from '../../../lib/wallet'
import QrCode from '../../../components/QrCode'

enum AddressType {
  Silent,
  Classic,
}

export default function ReceiveSuccess() {
  const { navigate } = useContext(NavigationContext)
  const { wallet } = useContext(WalletContext)
  const silentAddress = getSilentPaymentAddress(wallet)
  const classicAddress = getP2TRAddress(wallet)

  const [type, setType] = useState<AddressType>(AddressType.Silent)
  const [address, setAddress] = useState(getSilentPaymentAddress(wallet))
  const [copied, setCopied] = useState(false)

  const switchType = () => {
    setType(type === AddressType.Silent ? AddressType.Classic : AddressType.Silent)
    switch (type) {
      case AddressType.Silent:
        setAddress(classicAddress)
        break
      case AddressType.Classic:
        setAddress(silentAddress)
        break
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const goBackToWallet = () => navigate(Pages.Wallet)

  const addressType = () => (type === AddressType.Silent ? 'silent address' : 'classic address')

  return (
    <Container>
      <Content>
        <Title text='Receive' subtext={addressType()} />
        <div className='flex flex-col h-32 mt-6'>
          <div className='m-auto'>
            <QrCode value={address} />
          </div>
          <p
            className='text-md sm:text-sm text-gray-500 dark:text-gray-200 mt-2'
            style={{ maxWidth: '90vw', wordWrap: 'break-word' }}
          >
            {address.substring(0, 5)}<b>{address.substring(5, 13)}</b>{address.substring(13, address.length-8)}<b>{address.substring(address.length-8)}</b>
          </p>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button
          onClick={switchType}
          label={`Switch to ${type === AddressType.Silent ? 'classic' : 'silent'} address`}
        />
        <Button onClick={copyAddress} label={copied ? 'Copied' : 'Copy to clipboard'} />
        <Button onClick={goBackToWallet} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
