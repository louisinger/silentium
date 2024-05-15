import { ReactNode, createContext, useState } from 'react'
import { NetworkName } from '../lib/network'
import { CoinsSelected } from '../lib/coinSelection'

export interface InitInfo {
  mnemonic: string
  restoreFrom: number
  network?: NetworkName
}

export type SendInfo = {
  address?: string
  total?: number
  satoshis?: number
  txid?: string
  coinSelection?: CoinsSelected
}

interface FlowContextProps {
  initInfo: InitInfo
  sendInfo: SendInfo
  setInitInfo: (arg0: InitInfo) => void
  setSendInfo: (arg0: SendInfo) => void
}

export const emptyInitInfo: InitInfo = {
  mnemonic: '',
  restoreFrom: -1,
}

export const FlowContext = createContext<FlowContextProps>({
  initInfo: emptyInitInfo,
  sendInfo: {},
  setInitInfo: () => {},
  setSendInfo: () => {},
})

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [initInfo, setInitInfo] = useState(emptyInitInfo)
  const [sendInfo, setSendInfo] = useState({} as SendInfo)

  return (
    <FlowContext.Provider value={{ initInfo, sendInfo, setInitInfo, setSendInfo }}>
      {children}
    </FlowContext.Provider>
  )
}
