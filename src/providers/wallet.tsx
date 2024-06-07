import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useStorage } from '../lib/storage'
import { NavigationContext, Pages } from './navigation'
import { NetworkName } from '../lib/network'
import { Mnemonic, Transactions, Utxos, PublicKeys, Transaction, Utxo } from '../lib/types'
import { ExplorerName, getExplorerNames, getRestApiExplorerURL } from '../lib/explorers'
import { defaultExplorer, defaultNetwork } from '../lib/constants'
import { getP2TRAddress, getSilentPaymentScanPrivateKey, isInitialized } from '../lib/wallet'
import { SilentiumAPI } from '../lib/silentpayment/silentium/api'
import { EsploraChainSource } from '../lib/chainsource'
import { Updater, applyUpdate } from '../lib/updater'
import { notify } from '../components/Toast'

export interface Wallet {
  explorer: ExplorerName
  network: NetworkName
  mempoolTransactions: Transactions
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
    [NetworkName.Mainnet]: 'https://bitcoin.silentium.dev/v1',
    [NetworkName.Testnet]: 'https://testnet.silentium.dev/v1',
    [NetworkName.Regtest]: 'http://localhost:9000/v1',
  },
  mempoolTransactions: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
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
  pushMempoolTransaction: (spentCoins: { txid: string; vout: number }[], newUtxos: Utxo[], txid: string) => void
  wallet: Wallet
  scanning: boolean
  scanningProgress?: number
}

export const WalletContext = createContext<WalletContextProps>({
  changeExplorer: () => {},
  changeSilentiumURL: () => {},
  changeNetwork: () => {},
  reloadWallet: () => {},
  pushMempoolTransaction: () => {},
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

  // ensures that the testnet URL is set to the default value if it is empty
  useEffect(() => {
    if (wallet.silentiumURL[NetworkName.Testnet] === '') {
      setWallet({
        ...wallet,
        silentiumURL: {
          ...wallet.silentiumURL,
          [NetworkName.Testnet]: defaultWallet.silentiumURL[NetworkName.Testnet],
        },
      })
    }
  }, [wallet])

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
      try {
        const explorer = new EsploraChainSource(getRestApiExplorerURL(clone))
        const height = await explorer.getChainTipHeight()
        clone.scannedBlockHeight[networkName] = height
      } catch (e) {
        notify(extractErrorMessage(e))
        clone.scannedBlockHeight[networkName] = 0
      }
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
      const p2trScript = Buffer.from(getP2TRAddress(wallet).script)

      const updater = new Updater(explorer, scanPrivKey, spendPubKey, p2trScript)

      const totalBlocks = chainTip - wallet.scannedBlockHeight[wallet.network]
      const percentPerBlock = 100 / totalBlocks
      let progress = 0

      for (let i = wallet.scannedBlockHeight[wallet.network] + 1; i <= chainTip; i++) {
        try {
          const blockData = await silentiumAPI.getBlockData(i)

          const updateResult = await updater.updateHeight(
            blockData,
            wallet.utxos[wallet.network] ?? [],
            wallet.mempoolTransactions[wallet.network],
          )
          wallet = {
            ...applyUpdate(wallet, updateResult),
            scannedBlockHeight: { ...wallet.scannedBlockHeight, [wallet.network]: i },
          }
          setWallet(wallet)
        } catch (e) {
          notify(extractErrorMessage(e))
          console.error(e)
          continue
        } finally {
          progress += percentPerBlock
          progress = Math.min(progress, 100)
          setScanningProgress(Math.round(progress))
        }
      }
    } catch (e) {
      console.error(e)
      notify(extractErrorMessage(e))
    } finally {
      setScanning(false)
      setScanningProgress(undefined)
    }
  }

  const pushMempoolTransaction = (spentCoins: { txid: string; vout: number }[], newUtxos: Utxo[], txid: string) => {
    const tx: Transaction = {
      amount: 0,
      txid,
      unixdate: Math.floor(Date.now() / 1000),
    }

    for (const coin of spentCoins) {
      const utxo = wallet.utxos[wallet.network].find((u) => u.txid === coin.txid && u.vout === coin.vout)
      if (utxo) tx.amount -= utxo.value
    }

    for (const coin of newUtxos) {
      tx.amount += coin.value
    }

    const w: Wallet = {
      ...applyUpdate(wallet, {
        newUtxos: newUtxos,
        spentUtxos: spentCoins,
        transactions: [],
      }),
      mempoolTransactions: {
        ...wallet.mempoolTransactions,
        [wallet.network]: [...wallet.mempoolTransactions[wallet.network], tx],
      },
    }

    setWallet(w)
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
        pushMempoolTransaction,
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
