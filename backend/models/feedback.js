const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    customerName: { type: String, required: true },
    email: { type: String , required: true},
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    productItem: {
        type: String,
        enum: [
          'T-Shirts & Polos 👕',
          'Hoodies & Sweatshirts 🧥',
          'Shoes & Sandals 👟',
          'Handbags & Clutches 👜',
          'Jewelry & Accessories 💍',
          'Belts & Scarves 🧣',
          'Sunglasses 🕶️',
          'Hats & Caps 🧢',
          'Other Products'
        ],
        required: true
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      }
});

const Feedback = mongoose.model("Feedback",feedbackSchema);

module.exports = Feedback;