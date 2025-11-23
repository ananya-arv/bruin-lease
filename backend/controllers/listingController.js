const Listing = require('../models/Listing');


const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listings'
    });
  }
};


const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listing'
    });
  }
};


const createListing = async (req, res) => {
  try {
    const {
      title,
      price,
      address,
      zipCode,
      bedrooms,
      distanceFromUCLA,
      leaseDuration,
      description,
      images
    } = req.body;

    if (!title || price === undefined || !address || !zipCode || bedrooms === undefined || distanceFromUCLA === undefined || !leaseDuration || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    const listing = await Listing.create({
      owner: req.user._id,
      title,
      price,
      address,
      bedrooms,
      distanceFromUCLA,
      leaseDuration,
      description,
      images: images || []
    });

    const populatedListing = await Listing.findById(listing._id)
      .populate('owner', 'name email');

    res.status(201).json({
      status: 'success',
      data: populatedListing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating listing'
    });
  }
};


const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }


    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this listing'
      });
    }

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email');

    res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating listing'
    });
  }
};


const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this listing'
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting listing'
    });
  }
};


const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching your listings'
    });
  }
};

module.exports = {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};