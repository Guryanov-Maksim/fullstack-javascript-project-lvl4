import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({
  fields: ['name'],
});

class Status extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }
}

export default Status;
