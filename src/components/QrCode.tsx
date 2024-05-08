import QRCode from 'react-qr-code'

interface QrCodeProps {
  value: string
  onClick?: () => void
}

export default function QrCode({ value, onClick }: QrCodeProps) {
  return (
    <div className='w-[280px] mx-auto select-none'>
      {value ? (
        <div onClick={onClick} className='bg-white p-[10px]'>
          <QRCode value={value} fgColor='#000000' />
        </div>
      ) : null}
    </div>
  )
}
