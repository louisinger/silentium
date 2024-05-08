interface TitleProps {
  subtext?: string
  text: string
}

export default function Title({ subtext, text }: TitleProps) {
  return (
    <div className="mb-2">
      <h1 className='text-3xl text-primary font-bold'>{text}</h1>
      {subtext ? <h2 className='mt-1'>{subtext}</h2> : null}
    </div>
  )
}
