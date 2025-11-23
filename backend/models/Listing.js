const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true
  },
  zipCode: {  
    type: String,
    required: [true, 'Please add a zip code'],
    trim: true
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please add number of bedrooms'],
    min: [0, 'Bedrooms cannot be negative']
  },
  distanceFromUCLA: {
    type: Number,
    required: [true, 'Please add distance from UCLA in miles'],
    min: [0, 'Distance cannot be negative']
  },
  leaseDuration: {
    type: String,
    required: [true, 'Please add lease duration']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  images: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['Available', 'Pending', 'Rented'],
    default: 'Available'
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);