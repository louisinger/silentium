import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Content from '../../components/Content'
import Textarea from '../../components/Textarea'
import Container from '../../components/Container'
import NeedsPassword from '../../components/NeedsPassword'

export default function Backup() {
  const { toggleShowConfig } = useContext(ConfigContext)

  const [mnemonic, setMnemonic] = useState('')

  const handleClose = () => {
    toggleShowConfig()
  }

  return (
    <Container>
      <Content>
        <Title text='Backup' subtext='Save your data' />
        <Textarea label='Mnemonic' value={mnemonic} />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleClose} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword title='show mnemonic' onClose={handleClose} onMnemonic={setMnemonic} />
    </Container>
  )
}
