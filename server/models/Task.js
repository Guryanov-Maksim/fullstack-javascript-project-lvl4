import { Model } from 'objection';

import Status from './Status.js';
import User from './User.js';

class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: ['integer'], minimum: 1 },
        creatorId: { type: 'integer' },
        executorId: { type: ['integer'] },
      },
    };
  }

  static get relationMappings() {
    return {
      status: {
        relation: Model.HasOneRelation,
        modelClass: Status,
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },
      creator: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
      executor: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
    };
  }
}

export default Task;
