import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({task}) => {
  const navigate = useNavigate()

  return ( 
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
        <h1>{task.title}</h1>
        <p>{task.description}</p>
      </div>
   );
}

TaskCard.propTypes = {
  task: PropTypes.object.isRequired
}
 
export default TaskCard;