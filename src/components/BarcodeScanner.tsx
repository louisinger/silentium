import { useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface BarcodeScannerProps {
  setError: (arg0: string) => void
  setInvoice: (arg0: string) => void
}

export default function BarcodeScanner({ setError, setInvoice }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reader = useRef(new BrowserMultiFormatReader())

  useEffect(() => {
    const readerCurrent = reader.current
    reader.current.listVideoInputDevices().then((list) => {
      if (!videoRef.current || list.length === 0) {
        setError('Qr code reader unavailable')
        return
      }
      readerCurrent.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: 'environment',
          },
        },
        videoRef.current,
        (result) => {
          if (result) {
            const aux = JSON.stringify(result)
            setInvoice(JSON.parse(aux).text)
          }
        },
      )
    })

    return () => {
      readerCurrent.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef])

  return <video className='mx-auto mb-2' ref={videoRef} />
}
