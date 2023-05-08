import {useForm} from 'react-hook-form';
import { createTask } from '../api/tasks.api';
import { useNavigate } from 'react-router-dom';

const TasksFormPage = () => {
  const {register, handleSubmit, formState: {
    errors
  }} = useForm();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    await createTask(data)
    navigate('/tasks');
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
    </div>
  );
}
 
export default TasksFormPage;