import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Content from '../../components/Content'
import NewPassword from '../../components/NewPassword'
import NeedsPassword from '../../components/NeedsPassword'
import Container from '../../components/Container'
import { saveMnemonicToStorage } from '../../lib/storage'

export default function Password() {
  const { toggleShowConfig } = useContext(ConfigContext)

  const [label, setLabel] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')

  const handleProceed = () => {
    saveMnemonicToStorage(mnemonic, password)
    toggleShowConfig()
  }

  return (
    <Container>
      <Content>
        <Title text='Password' subtext='Change your password' />
        {mnemonic ? <NewPassword onNewPassword={setPassword} setLabel={setLabel} /> : null}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={!password} />
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword title='Unlock' onClose={toggleShowConfig} onMnemonic={setMnemonic} />
    </Container>
  )
}
