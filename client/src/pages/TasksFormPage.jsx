import {useForm} from 'react-hook-form';
import { createTask, updateTask } from '../api/tasks.api';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTask } from '../api/tasks.api';
import { useEffect } from 'react';
import { getTask } from '../api/tasks.api';
import { toast } from 'react-hot-toast';

const TasksFormPage = () => {
  const {register, handleSubmit, setValue, formState: {
    errors
  }} = useForm();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (!params.id) return;

    const loadTask = async () => {
      const {data} = await getTask(params.id);
      setValue('title', data.title);
      setValue('description', data.description);
    }

    loadTask();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updateTask(params.id, data);      
      toast.success('Task updated successfully', {
        position: 'top-right', 
        style: {
          background: '#101010',
          color: '#fff',
        }
      })
    } else {
      await createTask(data)
      toast.success('Task created successfully', {
        position: 'top-right', 
        style: {
          background: '#101010',
          color: '#fff',
        }
      })
    }

    navigate('/tasks');
  });

  return (
    <div className='max-w-xl mx-auto'>
      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          placeholder="title" 
          {...register('title', {required: true})}
          className='bg-zin-700 p-3 rounded-lg block w-full mb-3'
        />
        {errors.title && <span>Title is required</span>}

        <textarea 
          name="description" id="desc" cols="30" rows="10" 
          placeholder="Description" 
          {...register('description', {required: true})}
          className='bg-zin-700 p-3 rounded-lg block w-full mb-3'
        />
        {errors.description && <span>Description is required</span>}

        <div className='flex justify-between gap-4'>
        <button
          className='bg-indigo-500 p-3 rounded-lg w-full mt-3'
        >
          Submit
        </button>
          {params.id && (
              <button
                className='bg-red-500 p-3 rounded-lg w-48 mt-3'
                onClick={async () => {
                  const accepted = window.confirm('Are you sure?');
                  if (accepted) {
                    await deleteTask(params.id);
                    navigate('/tasks');
                    toast.success('Task deleted successfully', {
                      position: 'top-right', 
                      style: {
                        background: '#101010',
                        color: '#fff',
                      }
                    })
                  }
                }}
              >
                Delete
              </button>
          )}  
        </div>
      </form>      
    </div>
  );
}
 
export default TasksFormPage;