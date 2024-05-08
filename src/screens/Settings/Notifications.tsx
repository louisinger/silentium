import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Select from '../../components/Select'
import Content from '../../components/Content'
import Option from '../../components/Option'

export default function Notifications() {
  const { config, toggleShowConfig, updateConfig } = useContext(ConfigContext)

  const handleChange = (e: any) => {
    const notifications = Boolean(parseInt(e.target.value))
    Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        updateConfig({ ...config, notifications })
      }
    })
  }

  const value = config.notifications ? 1 : 0

  return (
    <div className='flex flex-col h-full justify-between'>
      <Content>
        <Title text='Notifications' subtext='Allow to receive notifications' />
        <Select onChange={handleChange} value={value}>
          <Option value='0'>Not allowed</Option>
          <Option value='1'>Allowed</Option>
        </Select>
        <p className='mt-10'>Not implemented yet</p>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </div>
  )
}
