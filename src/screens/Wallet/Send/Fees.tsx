import { useContext, useEffect, useState } from 'react'
import Button from '../../../components/Button'
import Title from '../../../components/Title'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import Content from '../../../components/Content'
import Container from '../../../components/Container'
import { FlowContext } from '../../../providers/flow'
import { prettyNumber } from '../../../lib/format'
import { WalletContext } from '../../../providers/wallet'
import Error from '../../../components/Error'
import Table from '../../../components/Table'
import { getBalance } from '../../../lib/wallet'
import { feesToSendSats } from '../../../lib/fees'
import { EsploraChainSource } from '../../../lib/chainsource'
import { getRestApiExplorerURL } from '../../../lib/explorers'
import Select from '../../../components/Select'
import { notify } from '../../../components/Toast'
import { AxiosError } from 'axios'
import Option from '../../../components/Option'

export default function SendFees() {
  const { wallet } = useContext(WalletContext)
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)
  const [error, setError] = useState('')
  const [feeRate, setFeeRate] = useState<number>()
  const [rates, setRates] = useState<{ fastest: number; halfHour: number; hour: number; day: number }>()
  const [totalNeeded, setTotalNeeded] = useState<number>(
    sendInfo.satoshis! + (sendInfo.txFees ? sendInfo.txFees?.amount : 0),
  )

  const { address, satoshis } = sendInfo

  useEffect(() => {
    if (satoshis) {
      if (address && feeRate) {
        const fees = feesToSendSats(satoshis, wallet, feeRate)
        setSendInfo({ ...sendInfo, address, txFees: { amount: fees, rate: feeRate }, total: satoshis })
        setTotalNeeded(satoshis + fees)
        return
      }
    }
  }, [address, feeRate])

  useEffect(() => {
    if (sendInfo.total) {
      if (getBalance(wallet) < totalNeeded)
        setError(`Insufficient funds, you just have ${prettyNumber(getBalance(wallet))} sats`)
    }
  }, [sendInfo.total])

  useEffect(() => {
    if (rates) return
    const chainSrc = new EsploraChainSource(getRestApiExplorerURL(wallet))
    chainSrc.getFeeRates().then((rates) => {
      setRates(rates)
      setFeeRate(rates.fastest)
    }).catch((e) => {
      console.error(e)
      if (e instanceof AxiosError) {
        setError('fee rates: ' + e.message)
      }
      notify('Error fetching fee rates')
    })
  }, [])

  const handleCancel = () => {
    setSendInfo({})
    navigate(Pages.Wallet)
  }

  const handlePay = () => navigate(Pages.SendPayment)

  const label = error ? 'Something went wrong' : feeRate ? 'Pay' : 'Loading...'

  return (
    <Container>
      <Content>
        <Title text='Payment fees' subtext={`You pay ${prettyNumber(totalNeeded)} sats`} />
        <div className='flex flex-col gap-2'>
          <Error error={Boolean(error)} text={error} />
          <Table
            data={[
              ['Amount', prettyNumber(satoshis)],
              ['Transaction fees', prettyNumber(sendInfo.txFees?.amount)],
              ['Total', prettyNumber(totalNeeded)],
            ]}
          />
          {feeRate && rates ? <Select label='Fee rate' value={feeRate} onChange={(e) => setFeeRate(e.target.value)}>
              <Option value={rates?.fastest}>{`10 mins (${prettyNumber(rates?.fastest, 1)} s/vbyte)`}</Option>
              <Option value={rates?.halfHour}>{`30 mins (${prettyNumber(rates?.halfHour, 1)} s/vbyte)`}</Option>
              <Option value={rates?.hour}>{`1 hour (${prettyNumber(rates?.hour, 1)} s/vbyte)`}</Option>
              <Option value={rates?.day}>{`1 day (${prettyNumber(rates?.day, 1)} s/vbyte)`}</Option>
            </Select> : null}
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handlePay} label={label} disabled={Boolean(error) || !Boolean(feeRate)} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
