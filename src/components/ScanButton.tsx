import { useContext, useState } from 'react'
import Button from './Button'
import { WalletContext } from '../providers/wallet'
import NeedsPassword from './NeedsPassword'
import ReloadIcon from '../icons/Reload'

export default function ScanButton() {
  const { wallet, reloadWallet, scanning, scanningProgress } = useContext(WalletContext)

  const [askPassword, setAskPassword] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()

  const handleScan = () => {
    if (!mnemonic) setAskPassword(true)
    else reloadWallet(mnemonic, wallet)
  }

  const handleMnemonicUnlock = (mnemonic: string) => {
    setMnemonic(mnemonic)
    reloadWallet(mnemonic, wallet)
  }

  return (
    <>
      {askPassword ? <NeedsPassword title='Sync' onMnemonic={handleMnemonicUnlock} onClose={() => setAskPassword(false)} /> : null}
      {scanning ? <p className='animate-bounce' >{wallet.scannedBlockHeight[wallet.network]} ({scanningProgress}%)</p> : null}
      <Button progress={scanningProgress} icon={<ReloadIcon />} label='Sync' onClick={() => handleScan()} disabled={scanning} />
    </>
  )
}
