import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useStorage } from '../lib/storage'
import { NavigationContext, Pages } from './navigation'
import { NetworkName } from '../lib/network'
import { Mnemonic, Transactions, Utxos, PublicKeys } from '../lib/types'
import { ExplorerName, getExplorerNames, getRestApiExplorerURL } from '../lib/explorers'
import { defaultExplorer, defaultNetwork } from '../lib/constants'
import { getSilentPaymentScanPrivateKey, isInitialized } from '../lib/wallet'
import { SilentiumAPI } from '../lib/silentpayment/silentium/api'
import { EsploraChainSource } from '../lib/chainsource'
import { Updater, applyUpdate } from '../lib/updater'
import { notify } from '../components/Toast'

export interface Wallet {
  explorer: ExplorerName
  network: NetworkName
  transactions: Transactions
  utxos: Utxos
  publicKeys: PublicKeys
  scannedBlockHeight: Record<NetworkName, number>
  silentiumURL: Record<NetworkName, string>
}

const defaultWallet: Wallet = {
  explorer: defaultExplorer,
  network: defaultNetwork,
  silentiumURL: {
    [NetworkName.Mainnet]: '',
    [NetworkName.Testnet]: '',
    [NetworkName.Regtest]: 'http://localhost:9000/v1',
  },
  transactions: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  utxos: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  publicKeys: {
    [NetworkName.Mainnet]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Regtest]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Testnet]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
  },
  scannedBlockHeight: {
    [NetworkName.Mainnet]: -1,
    [NetworkName.Regtest]: -1,
    [NetworkName.Testnet]: -1,
  },
}

interface WalletContextProps {
  changeExplorer: (e: ExplorerName) => void
  changeSilentiumURL: (url: string) => void
  changeNetwork: (n: NetworkName) => void
  reloadWallet: (mnemonic: Mnemonic, wallet: Wallet) => void
  resetWallet: () => void
  initWallet: (publicKeys: PublicKeys, restoreFrom?: number, network?: NetworkName) => Promise<Wallet>
  wallet: Wallet
  scanning: boolean
  scanningProgress?: number
}

export const WalletContext = createContext<WalletContextProps>({
  changeExplorer: () => {},
  changeSilentiumURL: () => {},
  changeNetwork: () => {},
  reloadWallet: () => {},
  resetWallet: () => {},
  initWallet: () => Promise.resolve(defaultWallet),
  wallet: defaultWallet,
  scanning: false,
  scanningProgress: undefined,
})

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { navigate } = useContext(NavigationContext)

  const [scanning, setScanning] = useState(false)
  const [scanningProgress, setScanningProgress] = useState<number>()
  const [wallet, setWallet] = useStorage<Wallet>('wallet', defaultWallet)

  const changeExplorer = async (explorer: ExplorerName) => {
    const clone = { ...wallet, explorer }
    setWallet(clone)
  }

  const changeNetwork = async (networkName: NetworkName) => {
    const clone = { ...wallet, network: networkName }
    const explorersFromNetwork = getExplorerNames(networkName)
    if (!explorersFromNetwork.includes(clone.explorer)) {
      clone.explorer = explorersFromNetwork[0]
    }

    if (wallet.scannedBlockHeight[networkName] === -1) {
      const explorer = new EsploraChainSource(getRestApiExplorerURL(clone))
      const height = await explorer.getChainTipHeight()
      clone.scannedBlockHeight[networkName] = height
    }

    setWallet(clone)
  }

  const changeSilentiumURL = async (url: string) => {
    const clone = {
      ...wallet,
      silentiumURL: {
        ...wallet.silentiumURL,
        [wallet.network]: url,
      },
    }
    setWallet(clone)
  }

  const reloadWallet = async (mnemonic: string, wallet: Wallet) => {
    if (!mnemonic || scanning) return
    try {
      setScanning(true)
      setScanningProgress(0)

      const silentiumAPI = new SilentiumAPI(wallet.silentiumURL[wallet.network])
      const chainTip = await silentiumAPI.getChainTipHeight()
      if (chainTip <= wallet.scannedBlockHeight[wallet.network]) {
        console.log('No new blocks to scan')
        return
      }

      const explorer = new EsploraChainSource(getRestApiExplorerURL(wallet))
      const scanPrivKey = await getSilentPaymentScanPrivateKey(mnemonic, wallet.network)
      const spendPubKey = Buffer.from(wallet.publicKeys[wallet.network].spendPublicKey, 'hex')
      const p2trPubKey = Buffer.from(wallet.publicKeys[wallet.network].p2trPublicKey, 'hex')
      const p2trScript = Buffer.concat([Buffer.from([0x51, 0x20]), p2trPubKey.slice(1)])

      const updater = new Updater(explorer, silentiumAPI, scanPrivKey, spendPubKey, p2trScript)

      const totalBlocks = chainTip - wallet.scannedBlockHeight[wallet.network] + 1
      const percentPerBlock = 100 / totalBlocks
      let progress = 0

      for (let i = wallet.scannedBlockHeight[wallet.network] + 1; i <= chainTip; i++) {
        const updateResult = await updater.updateHeight(i, wallet.utxos[wallet.network])
        wallet = {
          ...applyUpdate(wallet, updateResult),
          scannedBlockHeight: { ...wallet.scannedBlockHeight, [wallet.network]: i },
        }

        progress += percentPerBlock
        progress = Math.min(Math.round(progress), 100)

        setScanningProgress(progress)
        setWallet(wallet)
      }
    } catch (e) {
      console.error(e)
      notify(extractErrorMessage(e))
    } finally {
      setScanning(false)
      setScanningProgress(undefined)
    }
  }

  const resetWallet = () => {
    setWallet(defaultWallet)
    navigate(Pages.Init)
  }

  const initWallet = async (publicKeys: PublicKeys, restoreFrom?: number, network?: NetworkName) => {
    const explorer = new EsploraChainSource(getRestApiExplorerURL(wallet))
    const walletBirthHeight = restoreFrom ?? (await explorer.getChainTipHeight())
    const net = network ?? wallet.network

    const initWallet = {
      ...wallet,
      publicKeys,
      network: net,
      scannedBlockHeight: {
        ...defaultWallet.scannedBlockHeight,
        [net]: walletBirthHeight,
      },
      explorer: network ? getExplorerNames(net)[0] : wallet.explorer,
    }

    setWallet(initWallet)
    return initWallet
  }

  useEffect(() => {
    navigate(isInitialized(wallet) ? Pages.Wallet : Pages.Init)
  }, [])

  return (
    <WalletContext.Provider
      value={{
        changeExplorer,
        changeSilentiumURL,
        changeNetwork,
        reloadWallet,
        resetWallet,
        wallet,
        initWallet,
        scanning,
        scanningProgress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

function extractErrorMessage(e: any): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'An error occurred'
}
