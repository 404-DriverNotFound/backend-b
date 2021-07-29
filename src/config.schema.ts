import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  FT_APP_ID: Joi.string().required(),
  FT_APP_SECRET: Joi.string().required(),
  STAGE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
});
