import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import { WalletContext } from '../../providers/wallet'
import Content from '../../components/Content'
import LoadingIcon from '../../icons/Loading'
import NeedsPassword from '../../components/NeedsPassword'

export default function Reload() {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { scanning: reloading, reloadWallet, wallet } = useContext(WalletContext)

  const handleReload = (mnemonic: string) => reloadWallet(mnemonic, wallet)

  return (
    <div className='flex flex-col h-full justify-between'>
      <Content>
        <Title text='Reload' subtext='Reload your UTXOs' />
        {reloading ? (
          <center className='my-10'>
            <LoadingIcon />
            <p className='mt-10'>You can go back to wallet, reloading will keep working on the background</p>
          </center>
        ) : (
          <div className='flex flex-col gap-6 mt-10'>
            <p>Increase limit if you're missing some coins</p>
            <p>
              Higher values makes reloads take longer
              <br />
              and increases data usage
            </p>
          </div>
        )}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword title="Scan" onClose={toggleShowConfig} onMnemonic={handleReload} />
    </div>
  )
}
