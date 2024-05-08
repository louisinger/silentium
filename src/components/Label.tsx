interface LabelProps {
  pulse?: boolean
  text: string
}

export default function Label({ pulse, text }: LabelProps) {
  const className = 'block text-sm text-left font-medium mb-1' + (pulse ? ' animate-pulse' : '')
  return <label className={className}>{text}</label>
}
