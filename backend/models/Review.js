const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

reviewSchema.index({ listing: 1, user: 1 }, { unique: true });
reviewSchema.statics.calculateAverageRating = async function(listingId) {
  const stats = await this.aggregate([
    {
      $match: { listing: listingId }
    },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Listing').findByIdAndUpdate(listingId, {
      averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
      reviewCount: stats.length > 0 ? stats[0].reviewCount : 0
    });
  } catch (error) {
    console.error('Error updating listing stats:', error);
  }
};

reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.listing);
});

reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.listing);
});

module.exports = mongoose.model('Review', reviewSchema);