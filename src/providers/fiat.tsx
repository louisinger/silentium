import { ReactNode, createContext, useEffect, useRef, useState } from 'react'
import { FiatPrices, getPriceFeed } from '../lib/fiat'

type FiatContextProps = {
  getEurPrice: (sats: number) => number
  getUsdPrice: (sats: number) => number
  updateFiatPrices: () => void
}

const emptyFiatPrices: FiatPrices = { eur: 0, usd: 0 }

export const FiatContext = createContext<FiatContextProps>({
  getEurPrice: () => 0,
  getUsdPrice: () => 0,
  updateFiatPrices: () => {},
})

export const FiatProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false)

  const fiatPrices = useRef<FiatPrices>(emptyFiatPrices)

  const getEurPrice = (sats: number): number => sats * fiatPrices.current.eur
  const getUsdPrice = (sats: number): number => sats * fiatPrices.current.usd

  const updateFiatPrices = async () => {
    if (loading) return
    setLoading(true)
    const pf = await getPriceFeed()
    if (pf) fiatPrices.current = pf
    setLoading(false)
  }

  useEffect(() => {
    updateFiatPrices()
  }, [])

  return <FiatContext.Provider value={{ getEurPrice, getUsdPrice, updateFiatPrices }}>{children}</FiatContext.Provider>
}
