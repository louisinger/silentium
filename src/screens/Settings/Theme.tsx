import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext, Themes } from '../../providers/config'
import Select from '../../components/Select'
import Container from '../../components/Container'
import Content from '../../components/Content'
import Option from '../../components/Option'

export default function Theme() {
  const { config, toggleShowConfig, updateConfig } = useContext(ConfigContext)

  const handleChange = (e: any) => {
    updateConfig({ ...config, theme: e.target.value })
  }

  return (
    <Container>
      <Content>
        <Title text='Theme' subtext='Choose your theme' />
        <Select onChange={handleChange} value={config.theme}>
          <Option value={Themes.Dark}>{Themes.Dark}</Option>
          <Option value={Themes.Light}>{Themes.Light}</Option>
        </Select>
        <p className='mt-10'>Dark theme is easier on the eyes</p>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
