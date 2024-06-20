import { Joi, Segments, celebrate } from 'celebrate'

export default class RootValidator {
  register() {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        link: Joi.string().required(),
        type: Joi.string().valid(
          '3xyaoi',
          'yanpfansub',
          'sinensistoon',
          'mangaschan',
          'manganelo',
          'comiko',
          'gooffansub',
          'mto',
          'slimeread',
          'mangabuddy',
          'webtoons',
          'kaliscan',
          'bato'
        ),
      }),
    })
  }

  registerChapters() {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        link: Joi.string().required(),
        images: Joi.array().required(),
      }),
      [Segments.PARAMS]: Joi.object().keys({
        mangaId: Joi.string().required(),
      }),
    })
  }

  startProcessByType() {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        type: Joi.array().required(),
        onlyImages: Joi.bool().default(true),
      }),
    })
  }
}
