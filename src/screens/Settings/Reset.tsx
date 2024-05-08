import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import { WalletContext } from '../../providers/wallet'
import Content from '../../components/Content'
import Container from '../../components/Container'

export default function Restore({ backup }: { backup: () => void }) {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { resetWallet } = useContext(WalletContext)

  const handleReset = () => {
    resetWallet()
    toggleShowConfig()
  }

  return (
    <Container>
      <Content>
        <Title text='Reset wallet' />
        <div className='flex flex-col gap-6 mt-10'>
          <p>
            Did you{' '}
            <span className='underline cursor-pointer' onClick={backup}>
              backup your wallet
            </span>
            ?
          </p>
          <p>This operation cannot be undone.</p>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleReset} label='Reset wallet' />
        <Button onClick={toggleShowConfig} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
