import PropTypes from 'prop-types';

const TaskCard = ({task}) => {
  return ( 
    <div>
        <h1>{task.title}</h1>
        <p>{task.description}</p>
      </div>
   );
}

TaskCard.propTypes = {
  task: PropTypes.object.isRequired
}
 
export default TaskCard;