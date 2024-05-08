import { formatLongString, prettyNumber } from '../lib/format'

export const Item = ({ title, body }: { title: string; body: string }) => {
  return (
    <div className='mb-8'>
      <p className='font-bold'>{title}</p>
      <p className=''>{body}</p>
    </div>
  )
}

export interface PaymentDetailsProps {
  address?: string
  invoice?: string
  note?: string
  satoshis: number
}

export default function PaymentDetails({ details }: { details?: PaymentDetailsProps }) {
  if (!details) return <></>
  const { address, invoice, note, satoshis } = details
  return (
    <div>
      <Item title='Amount' body={`${prettyNumber(satoshis)} sats`} />
      {note ? <Item title='Note' body={note} /> : null}
      {invoice ? <Item title='Invoice' body={formatLongString(invoice)} /> : null}
      {address ? <Item title='Address' body={formatLongString(address)} /> : null}
    </div>
  )
}
