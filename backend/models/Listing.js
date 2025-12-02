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
  country: {
    type: String,
    required: [true, 'Please add a country'],
    trim: true,
    default: 'USA'
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
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        // Validate array length
        if (arr.length > 10) return false;
        // Validate each image is a string
        return arr.every(img => typeof img === 'string');
      },
      message: 'Images must be an array of strings with maximum 10 items'
    }
  },
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

// Index for faster queries
listingSchema.index({ owner: 1, createdAt: -1 });
listingSchema.index({ availability: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ distanceFromUCLA: 1 });

module.exports = mongoose.model('Listing', listingSchema);