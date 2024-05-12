import { useContext } from 'react'
import Button from '../../../components/Button'
import SuccessIcon from '../../../icons/Success'
import Title from '../../../components/Title'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import Content from '../../../components/Content'
import Container from '../../../components/Container'
import { openInNewTab } from '../../../lib/explorers'
import { FlowContext } from '../../../providers/flow'
import { WalletContext } from '../../../providers/wallet'

export default function SendSuccess() {
  const { sendInfo } = useContext(FlowContext)
  const { navigate } = useContext(NavigationContext)
  const { wallet } = useContext(WalletContext)

  const handleExplorer = () => {
    if (!sendInfo.txid) return
    openInNewTab(sendInfo.txid, wallet)
  }

  const goBackToWallet = () => navigate(Pages.Wallet)

  return (
    <Container>
      <Content>
        <Title text='Success' subtext='Payment sent' />
        <div className='flex flex-col h-60'>
          <div className='m-auto'>
            <SuccessIcon />
          </div>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleExplorer} label='View on explorer' />
        <Button onClick={goBackToWallet} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
