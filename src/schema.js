const Joi = require("joi");

const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
  }),
  price: Joi.number().required().min(0),
  location: Joi.string().required(),
  country: Joi.string().required(),
});

const reviewSchema = Joi.object({
  reviews: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

module.exports = { listingSchema, reviewSchema };