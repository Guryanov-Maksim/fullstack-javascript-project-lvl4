import objectionUnique from 'objection-unique';

import encrypt from '../lib/secure.js';
import BaseModel from './BaseModel.js';

const unique = objectionUnique({
  fields: ['email'],
})

class User extends unique(BaseModel) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  // usual setter for an plain js object.
  // Used during registration.
  // It creates a passwordDigest property with an encrypted password during changing the password property
  // objectionjs sets the password property itself during 
  //      user.$set(request.body.data); 
  // and 
  //      const validUser = await app.objection.models.user.fromJson(request.body.data);
  // passwordDigest will be saved in the db
  set password(value) { 
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return this.passwordDigest === encrypt(password);
  }
}

export default User;
