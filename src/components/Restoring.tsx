import Loading from './Loading'

interface RestoringProps {
  restoring: number
}

export default function Restoring({ restoring }: RestoringProps) {
  return (
    <>
      <Loading />
      <p>
        Restoring wallet
        <br />
        {restoring > 0 ? `${restoring} transaction${restoring > 1 ? 's' : ''} to go` : 'please wait'}
      </p>
    </>
  )
}
