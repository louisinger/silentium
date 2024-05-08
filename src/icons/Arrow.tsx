export default function ArrowIcon({ tiny }: { tiny?: boolean }) {
  return (
    <svg className={tiny ? 'mt-1 w-4 h-4' : 'w-6 h-6'} viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path fill='none' stroke='currentColor' strokeWidth='2' d='m7 2l10 10L7 22' />
    </svg>
  )
}
