import Label from './Label'

interface WordProps {
  label?: number
  onChange?: (arg0: any) => void
  right?: string
  text?: string
}

export default function Word({ label, onChange, right, text }: WordProps) {
  const className =
    'w-full p-3 text-sm font-semibold bg-gray-100 dark:bg-darklessgray focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-md'

  return (
    <fieldset>
      {label ? <Label text={'word ' + String(label)} /> : null}
      {onChange ? (
        <input className={className} onChange={onChange} value={text} />
      ) : (
        <p className={className}>{text}</p>
      )}
      {right ? (
        <span className='flex items-center px-3 pointer-events-none text-sm rounded-r-md bg-gray-700 dark:bg-gray-200'>
          {right}
        </span>
      ) : null}
    </fieldset>
  )
}
