import {useForm} from 'react-hook-form';
import { createTask, updateTask } from '../api/tasks.api';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTask } from '../api/tasks.api';
import { useEffect } from 'react';
import { getTask } from '../api/tasks.api';

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
    navigate('/tasks');

    if (params.id) {
      await updateTask(params.id, data);
      return;
    }

    await createTask(data)
  });

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          placeholder="title" 
          {...register('title', {required: true})}
        />
        {errors.title && <span>Title is required</span>}

        <textarea 
          name="description" id="desc" cols="30" rows="10" 
          placeholder="Description" 
          {...register('description', {required: true})}
        />
        {errors.description && <span>Description is required</span>}

        <button>Submit</button>
      </form>

      {params.id && (
        <button
          onClick={async () => {
            const accepted = window.confirm('Are you sure?');
            if (accepted) {
              await deleteTask(params.id);
              navigate('/tasks');
            }
          }}
        >
          Delete
        </button> 
      )}
      
    </div>
  );
}
 
export default TasksFormPage;