import { useContext, useEffect, useState } from 'react'
import { validateMnemonic } from 'bip39'
import Button from '../../components/Button'
import Title from '../../components/Title'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Columns from '../../components/Columns'
import Word from '../../components/Word'
import Error from '../../components/Error'
import { NavigationContext, Pages } from '../../providers/navigation'
import Content from '../../components/Content'
import { FlowContext } from '../../providers/flow'
import Container from '../../components/Container'
import Input from '../../components/Input'
import Select from '../../components/Select'
import { defaultNetwork } from '../../lib/constants'
import { NetworkName } from '../../lib/network'
import Option from '../../components/Option'

enum ButtonLabel {
  Incomplete = 'Incomplete mnemonic',
  Invalid = 'Invalid mnemonic',
  Ok = 'Continue',
}

enum Step {
  Passphrase,
  BirthHeight,
}

export default function InitOld() {
  const { navigate } = useContext(NavigationContext)
  const { setInitInfo } = useContext(FlowContext)

  const [label, setLabel] = useState(ButtonLabel.Incomplete)
  const [passphrase, setPassphrase] = useState(Array.from({ length: 12 }, () => ''))
  const [birthHeight, setBirthHeight] = useState(-1)
  const [network, setNetwork] = useState(defaultNetwork)
  const [step, setStep] = useState(Step.Passphrase)

  useEffect(() => {
    const completed = [...passphrase].filter((a) => a)?.length === 12
    if (!completed) return setLabel(ButtonLabel.Incomplete)
    const valid = validateMnemonic(passphrase.join(' '))
    setLabel(valid ? ButtonLabel.Ok : ButtonLabel.Invalid)
  }, [passphrase])

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const birth = parseInt(value, 10)
    if (Number.isNaN(birth) || birth < 0) setLabel(ButtonLabel.Invalid)
    setBirthHeight(parseInt(value, 10))
    setLabel(ButtonLabel.Ok)
  }

  const handleChange = (e: any, i: number) => {
    const { value } = e.target
    if (i === 0 && value.split(/\s+/).length === 12) {
      setPassphrase(value.split(/\s+/))
    } else {
      const clone = [...passphrase]
      clone[i] = value
      setPassphrase(clone)
    }
  }

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    if (step === Step.Passphrase) {
      setStep(Step.BirthHeight)
      return
    }

    const mnemonic = passphrase.join(' ')
    setInitInfo({ mnemonic, restoreFrom: birthHeight, network: network as NetworkName })
    navigate(Pages.InitPassword)
  }

  const disabled = label !== ButtonLabel.Ok

  return (
    <Container>
      <Content>
        <Title text='Restore wallet' subtext='Insert your secret words' />
        {step === Step.Passphrase ? (
          <div className='flex flex-col gap-2 align-middle justify-center'>
            <Error error={label === ButtonLabel.Invalid} text={label} />
            <Columns>
              {[...passphrase].map((word, i) => (
                <Word key={word} left={i + 1} onChange={(e: any) => handleChange(e, i)} text={word} />
              ))}
            </Columns>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            <Select label='Network' value={network} onChange={(e) => setNetwork(e.target.value)}>
              <Option value={NetworkName.Mainnet}>mainnet</Option>
              <Option value={NetworkName.Testnet}>testnet</Option>
              <Option value={NetworkName.Regtest}>regtest</Option>
            </Select>
            <Input label='Birth block height' onChange={handleBirthChange} type='number' />
          </div>
        )}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={disabled} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
