interface Props {
    value: string | number    
    children: React.ReactNode
}


export default function Option(props: Props) {
  return (
    <option className='bg-gray-100 dark:bg-darkgray checked:dark:bg-primary aria-checked:dark:bg-primary border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-lg rounded-lg w-full p-2.5' value={props.value}>{props.children}</option>
  )
}