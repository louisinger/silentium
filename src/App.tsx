import { useContext } from 'react'
import Init from './screens/Init/Init'
import Wallet from './screens/Wallet/Index'
import Header from './components/Header'
import Settings from './screens/Settings/Index'
import Loading from './components/Loading'
import SendDetails from './screens/Wallet/Send/Details'
import SendPayment from './screens/Wallet/Send/Pay'
import InitNew from './screens/Init/New'
import InitOld from './screens/Init/Restore'
import SendFees from './screens/Wallet/Send/Fees'
import ReceiveAddress from './screens/Wallet/Receive/Address'
import { ConfigContext } from './providers/config'
import { NavigationContext, Pages } from './providers/navigation'
import InitPassword from './screens/Init/Password'
import OuterContainer from './components/OuterContainer'
import SendSuccess from './screens/Wallet/Send/Success'
import Transactions from './screens/Wallet/Transactions'
import SendAmount from './screens/Wallet/Send/Amount'

export default function App() {
  const { loading, showConfig } = useContext(ConfigContext)
  const { screen } = useContext(NavigationContext)

  if (loading) return <Loading />
  if (showConfig) return <Settings />

  return (
    <OuterContainer>
      <Header />
      <div className='grow'>
        {screen === Pages.Init && <Init />}
        {screen === Pages.InitNew && <InitNew />}
        {screen === Pages.InitOld && <InitOld />}
        {screen === Pages.InitPassword && <InitPassword />}
        {screen === Pages.ReceiveAddress && <ReceiveAddress />}
        {screen === Pages.SendAmount && <SendAmount />}
        {screen === Pages.SendDetails && <SendDetails />}
        {screen === Pages.SendFees && <SendFees />}
        {screen === Pages.SendPayment && <SendPayment />}
        {screen === Pages.SendSuccess && <SendSuccess />}
        {screen === Pages.Transactions && <Transactions />}
        {screen === Pages.Wallet && <Wallet />}
      </div>
    </OuterContainer>
  )
}
