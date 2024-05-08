import { ReactNode, createContext, useEffect, useState } from 'react'
import { clearStorage, readConfigFromStorage, saveConfigToStorage } from '../lib/storage'

export enum Themes {
  Dark = 'Dark',
  Light = 'Light',
}

export enum Unit {
  BTC = 'btc',
  EUR = 'eur',
  USD = 'usd',
}

export interface Config {
  notifications: boolean
  theme: Themes
  unit: Unit
}

const defaultConfig: Config = {
  notifications: false,
  theme: Themes.Light,
  unit: Unit.BTC,
}

interface ConfigContextProps {
  config: Config
  loading: boolean
  resetConfig: () => void
  showConfig: boolean
  toggleShowConfig: () => void
  updateConfig: (c: Config) => void
}

export const ConfigContext = createContext<ConfigContextProps>({
  config: defaultConfig,
  loading: true,
  resetConfig: () => {},
  showConfig: false,
  toggleShowConfig: () => {},
  updateConfig: () => {},
})

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)

  const toggleShowConfig = () => setShowConfig(!showConfig)

  const preferredTheme = () =>
    window?.matchMedia?.('(prefers-color-scheme: dark)').matches ? Themes.Dark : Themes.Light

  const updateConfig = (data: Config) => {
    setConfig(data)
    updateTheme(data)
    saveConfigToStorage(data)
  }

  const updateTheme = ({ theme }: Config) => {
    if (theme === Themes.Dark) document.body.classList.add('dark')
    else document.body.classList.remove('dark')
  }

  const resetConfig = () => {
    clearStorage()
    updateConfig(defaultConfig)
  }

  useEffect(() => {
    if (!loading) return
    const config = readConfigFromStorage() ?? { ...defaultConfig, theme: preferredTheme() }
    updateConfig(config)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <ConfigContext.Provider value={{ config, loading, resetConfig, showConfig, toggleShowConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}
