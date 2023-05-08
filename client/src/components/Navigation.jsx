import {Link} from 'react-router-dom'

const Navigation = () => {
  return (
    <div className='pb-8'>
      <div className='grid grid-cols-3 gap-10 py-3'>
        <Link className='col-start-2 place-self-center' to='/tasks'><h1 className='font-bold text-3xl'>Task App</h1></Link>
        <div className='place-self-end'>
          <button className='bg-indigo-500 px-3 rounded-lg h-14'>
            <Link to='/tasks-create'>Create task</Link>        
          </button>      
        </div>
      </div>
    </div>
  );
}
 
export default Navigation;