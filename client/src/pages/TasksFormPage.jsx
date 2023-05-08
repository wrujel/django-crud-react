import {useForm} from 'react-hook-form';
import { createTask } from '../api/tasks.api';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTask } from '../api/tasks.api';

const TasksFormPage = () => {
  const {register, handleSubmit, formState: {
    errors
  }} = useForm();
  const navigate = useNavigate();
  const params = useParams();

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