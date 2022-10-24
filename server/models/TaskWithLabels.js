import { Model } from 'objection';

class TaskWithLabels extends Model {
  static get tableName() {
    return 'tasks_with_labels';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        taskId: { type: 'integer' },
        labelId: { type: 'integer' },
      },
    };
  }
}

export default TaskWithLabels;
