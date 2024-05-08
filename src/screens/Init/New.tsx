import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Columns from '../../components/Columns'
import Title from '../../components/Title'
import Word from '../../components/Word'
import { generateMnemonic } from 'bip39'
import { NavigationContext, Pages } from '../../providers/navigation'
import { Mnemonic } from '../../lib/types'
import Content from '../../components/Content'
import { FlowContext } from '../../providers/flow'
import Container from '../../components/Container'

export default function InitNew() {
  const { navigate } = useContext(NavigationContext)
  const { setInitInfo } = useContext(FlowContext)

  const mnemonic = generateMnemonic() as Mnemonic

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    setInitInfo({ mnemonic, restoreFrom: -1 })
    navigate(Pages.InitPassword)
  }

  return (
    <Container>
      <Content>
        <Title text='Your new wallet' subtext='Write down the following words' />
        <p className='p-2' />
        <Columns>
          {mnemonic.split(' ').map((word, i) => (
            <Word key={word} left={i + 1} text={word} />
          ))}
        </Columns>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label='Continue' />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
