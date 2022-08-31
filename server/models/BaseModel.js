import { AjvValidator, Model } from 'objection';
import addFormats from "ajv-formats";

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv: ajv => {
        addFormats(ajv);
      },
      options: {
        allErrors: true,
        validateSchema: false,
        ownProperties: true,
        v5: true
      }
    });
  }
}

export default BaseModel;
