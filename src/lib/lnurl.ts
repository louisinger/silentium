import { bech32, utf8 } from '@scure/base'

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

type LnUrlResponse = {
  minSendable: number
  maxSendable: number
  callback: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LnUrlCallbackResponse = {
  pr: string
}

const checkResponse = <T = any>(response: Response): Promise<T> => {
  if (!response.ok) return Promise.reject(response)
  return response.json()
}

const checkLnUrlResponse = (amount: number, data: LnUrlResponse) => {
  if (amount < data.minSendable || amount > data.maxSendable) {
    throw new Error('Amount not in LNURL range.')
  }
  return data
}

const fetchLnUrlInvoice = async (amount: number, data: LnUrlResponse) => {
  const res = await fetch(`${data.callback}?amount=${amount}`).then(checkResponse<LnUrlCallbackResponse>)
  return res.pr
}

const isValidBech32 = (data: string) => {
  try {
    bech32.decodeToBytes(data)
    return true
  } catch (e) {
    return false
  }
}

const isLnUrl = (data: string) => {
  data = data.toLowerCase().replace('lightning:', '')
  return data.startsWith('lnurl') && isValidBech32(data)
}

const isLnAddress = (data: string) => {
  data = data.toLowerCase().replace('lightning:', '')
  return data.includes('@') && emailRegex.test(data)
}

export const isValidLnUrl = (data: string): boolean => isLnUrl(data) || isLnAddress(data)

export const getCallbackUrl = (lnurl: string) => {
  if (isLnAddress(lnurl)) {
    // Lightning address
    const urlsplit = lnurl.split('@')
    return `https://${urlsplit[1]}/.well-known/lnurlp/${urlsplit[0]}`
  }
  // LNURL
  const { bytes } = bech32.decodeToBytes(lnurl)
  return utf8.encode(bytes)
}

export const fetchLnUrl = (lnurl: string, sats: number): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const url = getCallbackUrl(lnurl)
    const amount = Math.round(sats * 1000) // milisatoshis
    fetch(url)
      .then(checkResponse<LnUrlResponse>)
      .then((data) => checkLnUrlResponse(amount, data))
      .then((data) => fetchLnUrlInvoice(amount, data))
      .then(resolve)
      .catch(reject)
  })
}
