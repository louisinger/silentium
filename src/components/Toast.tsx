import classNames from 'classnames';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';

export const notify = (msg: string) =>
  toast.custom(
    (t) => (
      <div
        className={classNames([
          'flex flex-row items-center justify-between w-96 bg-gray-900 px-4 py-6 text-white shadow-2xl hover:shadow-none transform-gpu translate-y-0 hover:translate-y-1 rounded-xl relative transition-all duration-500 ease-in-out',
          'dark:bg-darklessgray dark:test-white',
          { 'top-0': t.visible },
          { '-top-96': !t.visible}
        ])}
      >
        <div className='flex flex-col items-start justify-center ml-1 cursor-default'>
          <p>
            {msg}
          </p>
        </div>
        <div className='absolute top-2 right-2 cursor-pointer text-lg' onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: 'unique-notification', position: 'top-center' }
  );

