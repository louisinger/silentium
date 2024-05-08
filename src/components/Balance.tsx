import { useContext } from 'react'
import { fromSatoshis, prettyNumber } from '../lib/format'
import { Satoshis } from '../lib/types'
import Title from './Title'
import { FiatContext } from '../providers/fiat'
import { ConfigContext, Unit } from '../providers/config'

interface BalanceProps {
  value: Satoshis
}

export default function Balance({ value }: BalanceProps) {
  const { config, updateConfig } = useContext(ConfigContext)
  const { getEurPrice, getUsdPrice } = useContext(FiatContext)

  const btc = fromSatoshis(value)

  const subTexts = {
    [Unit.BTC]: prettyNumber(btc, 8) + ' BTC',
    [Unit.EUR]: prettyNumber(getEurPrice(btc), 2) + ' EUR',
    [Unit.USD]: prettyNumber(getUsdPrice(btc), 2) + ' USD',
  }

  const handleClick = () => {
    const { unit } = config
    if (!unit) return updateConfig({ ...config, unit: Unit.EUR })
    if (unit === Unit.BTC) return updateConfig({ ...config, unit: Unit.EUR })
    if (unit === Unit.EUR) return updateConfig({ ...config, unit: Unit.USD })
    if (unit === Unit.USD) return updateConfig({ ...config, unit: Unit.BTC })
  }

  const text = prettyNumber(value) + ' sats'
  const subtext = subTexts[config.unit ?? Unit.BTC]

  return (
    <div className='cursor-pointer' onClick={handleClick}>
      <Title text={text} subtext={subtext} />
    </div>
  )
}
