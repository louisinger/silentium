export default function Table({ data }: { data: string[][] }) {
  return (
    <table className='w-full table-fixed mt-0.5'>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row[0]} className={idx + 1 === data.length ? 'border-t' : ''}>
            <td className='py-3 text-left font-semibold'>{row[0]}</td>
            <td className='py-3 text-right'>{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
