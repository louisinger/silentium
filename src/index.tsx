import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { ConfigProvider } from './providers/config'
import { NavigationProvider } from './providers/navigation'
import { FlowProvider } from './providers/flow'
import { WalletProvider } from './providers/wallet'
import { FiatProvider } from './providers/fiat'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // <React.StrictMode>
  <NavigationProvider>
    <ConfigProvider>
      <FiatProvider>
        <WalletProvider>
          <FlowProvider>
            <App />
          </FlowProvider>
        </WalletProvider>
      </FiatProvider>
    </ConfigProvider>
  </NavigationProvider>,
  // </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()
