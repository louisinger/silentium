import { useContext, useState } from 'react'
import Button from '../../../components/Button'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { FlowContext } from '../../../providers/flow'
import Content from '../../../components/Content'
import Title from '../../../components/Title'
import Container from '../../../components/Container'
import NeedsPassword from '../../../components/NeedsPassword'
import { prettyNumber } from '../../../lib/format'
import { WalletContext } from '../../../providers/wallet'
import { sendSats, sendSatsResult } from '../../../lib/transactions'
import Error from '../../../components/Error'
import Loading from '../../../components/Loading'
import { notify } from '../../../components/Toast'
import { extractError } from '../../../lib/error'
import { EsploraChainSource } from '../../../lib/chainsource'
import { getRestApiExplorerURL } from '../../../lib/explorers'

export default function SendPayment() {
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)
  const { wallet, pushMempoolTransaction } = useContext(WalletContext)

  const [error, setError] = useState('')

  const { total } = sendInfo

  const onTx = async ({ hex, newUtxos, selectedCoins }: sendSatsResult) => {
    if (!hex) {
      return setError('Error broadcasting transaction')
    }

    const chainSrc = new EsploraChainSource(getRestApiExplorerURL(wallet))

    const txid = await chainSrc.broadcast(hex)

    setSendInfo({ ...sendInfo, txid })
    pushMempoolTransaction(selectedCoins, newUtxos, txid)
    navigate(Pages.SendSuccess)
  }

  const goBackToWallet = () => {
    setSendInfo({})
    navigate(Pages.Wallet)
  }

  const onMnemonic = (mnemonic: string) => {
    if (!mnemonic) return

    if (sendInfo.address && sendInfo.total && sendInfo.txFees) {
      sendSats(sendInfo.total, sendInfo.address, wallet, mnemonic, sendInfo.txFees.rate)
        .then(onTx)
        .catch((e) => {
          console.error(e)
          notify(extractError(e))
        })
    }
  }

  return (
    <Container>
      <Content>
        <Title text='Pay' subtext={`Paying ${prettyNumber(total ?? 0)} sats`} />
        {error ? <Error error={Boolean(error)} text={error} /> : <Loading />}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={goBackToWallet} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword title='Pay' onClose={goBackToWallet} onMnemonic={onMnemonic} />
    </Container>
  )
}
