import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Content from '../../components/Content'
import Container from '../../components/Container'

export default function About() {
  const { toggleShowConfig } = useContext(ConfigContext)
  return (
    <Container>
      <Content>
        <Title text='About' />
        <div className='flex flex-col gap-6 mt-10'>
          <p>
            Uses{' '}
            <a className='underline cursor-pointer' href='https://mempool.space'>
              mempool.space
            </a>{' '}
            or{' '}
            <a className='underline cursor-pointer' href='https://blockstream.info'>
              blockstream.info
            </a>{' '}
            to fetch information from the chain
          </p>
          <p className='underline cursor-pointer'>
            <a href='https://github.com/louisinger/silentium'>Github</a>
          </p>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
