import { Joi, Segments, celebrate } from 'celebrate'

export default class AdmValidator {
  updateHeaders() {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        headers: Joi.object().required(),
        type: Joi.string().required(),
      }),
    })
  }
}
