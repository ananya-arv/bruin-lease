// backend/seedListings.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Listing = require('./models/Listing');

dotenv.config();

const sampleListings = [
  {
    title: "Cozy Studio Near UCLA Campus",
    price: 1800,
    address: "10850 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 0,
    distanceFromUCLA: 0.3,
    leaseDuration: "1 year",
    description: "Perfect for students! Walking distance to campus, includes utilities, quiet building with study lounge.",
    availability: "Available"
  },
  {
    title: "Spacious 2BR Apartment in Westwood",
    price: 3200,
    address: "10990 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Modern apartment with updated kitchen, in-unit laundry, parking included. Close to shops and restaurants.",
    availability: "Available"
  },
  {
    title: "Bright 1BR Near Westwood Village",
    price: 2400,
    address: "1037 Glendon Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.4,
    leaseDuration: "6 months",
    description: "Hardwood floors, lots of natural light, walking distance to campus and village. Pet-friendly!",
    availability: "Available"
  },
  {
    title: "Luxury 3BR Apartment with Pool",
    price: 4500,
    address: "10889 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 3,
    distanceFromUCLA: 0.6,
    leaseDuration: "1 year",
    description: "High-end finishes, building amenities include pool, gym, and concierge. Parking for 2 cars.",
    availability: "Pending"
  },
  {
    title: "Affordable Studio in West LA",
    price: 1650,
    address: "1733 Westwood Blvd, Los Angeles, CA 90024",
    bedrooms: 0,
    distanceFromUCLA: 0.8,
    leaseDuration: "Month-to-month",
    description: "Great for grad students. Quiet neighborhood, near bus lines, utilities included.",
    availability: "Available"
  },
  {
    title: "Charming 2BR Bungalow",
    price: 3500,
    address: "10850 Le Conte Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.2,
    leaseDuration: "1 year",
    description: "Rare find! Private yard, updated kitchen, hardwood floors throughout. Steps from campus.",
    availability: "Available"
  },
  {
    title: "Modern 1BR with Balcony",
    price: 2600,
    address: "927 Hilgard Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.3,
    leaseDuration: "1 year",
    description: "Recently renovated with stainless appliances, granite counters, and private balcony with campus views.",
    availability: "Available"
  },
  {
    title: "Shared 4BR House Near UCLA",
    price: 3800,
    address: "638 Veteran Ave, Los Angeles, CA 90024",
    bedrooms: 4,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Perfect for roommates! Large living areas, backyard, 2 bathrooms, parking available.",
    availability: "Available"
  },
  {
    title: "Quiet 1BR in Residential Area",
    price: 2200,
    address: "10833 Le Conte Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.4,
    leaseDuration: "1 year",
    description: "Peaceful location, perfect for studying. Close to campus but away from the noise.",
    availability: "Rented"
  },
  {
    title: "Sunny 2BR with Parking",
    price: 3000,
    address: "10850 Weyburn Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.3,
    leaseDuration: "1 year",
    description: "Lots of windows, updated fixtures, includes 1 parking space. Walk to classes in 10 minutes!",
    availability: "Available"
  },
  {
    title: "Penthouse 2BR with Rooftop Access",
    price: 4200,
    address: "10945 Weyburn Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.4,
    leaseDuration: "1 year",
    description: "Top floor unit with stunning views, modern appliances, access to rooftop terrace.",
    availability: "Available"
  },
  {
    title: "Budget-Friendly Studio",
    price: 1550,
    address: "1740 Westwood Blvd, Los Angeles, CA 90024",
    bedrooms: 0,
    distanceFromUCLA: 0.9,
    leaseDuration: "6 months",
    description: "Great starter apartment for undergrads. Basic but clean, near grocery stores and bus stops.",
    availability: "Available"
  },
  {
    title: "Elegant 1BR with Gym Access",
    price: 2800,
    address: "10820 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Building amenities include fitness center, pool, and covered parking. Modern finishes.",
    availability: "Pending"
  },
  {
    title: "Spacious 3BR for Roommates",
    price: 4000,
    address: "619 Gayley Ave, Los Angeles, CA 90024",
    bedrooms: 3,
    distanceFromUCLA: 0.3,
    leaseDuration: "1 year",
    description: "Ideal for 3 students. Large bedrooms, 2 full baths, in-unit laundry, balcony.",
    availability: "Available"
  },
  {
    title: "Renovated 2BR Near Westwood Village",
    price: 3300,
    address: "1033 Gayley Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.4,
    leaseDuration: "1 year",
    description: "Completely remodeled with luxury vinyl flooring, quartz countertops, and stainless appliances.",
    availability: "Available"
  },
  {
    title: "Charming 1BR with Fireplace",
    price: 2500,
    address: "10850 Lindbrook Dr, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.6,
    leaseDuration: "1 year",
    description: "Unique unit with working fireplace, high ceilings, and vintage charm. Parking included.",
    availability: "Available"
  },
  {
    title: "Large 4BR House with Yard",
    price: 5000,
    address: "562 Veteran Ave, Los Angeles, CA 90024",
    bedrooms: 4,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Perfect for a group! 3 bathrooms, large kitchen, private backyard, and garage parking.",
    availability: "Available"
  },
  {
    title: "Modern Studio in High-Rise",
    price: 1900,
    address: "10990 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 0,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Secure building with doorman, rooftop deck, and fitness center. Great city views.",
    availability: "Available"
  },
  {
    title: "Cozy 1BR Garden Apartment",
    price: 2300,
    address: "10833 Ashton Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.7,
    leaseDuration: "6 months",
    description: "Ground floor with patio access, quiet building, perfect for someone with a bike.",
    availability: "Available"
  },
  {
    title: "Deluxe 2BR with City Views",
    price: 3600,
    address: "10889 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.6,
    leaseDuration: "1 year",
    description: "Floor-to-ceiling windows, modern kitchen, in-unit washer/dryer, and 2 parking spaces.",
    availability: "Pending"
  },
  {
    title: "Vintage 1BR with Character",
    price: 2100,
    address: "1060 Glendon Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.4,
    leaseDuration: "Month-to-month",
    description: "Classic Westwood apartment with original hardwoods, arched doorways, and tons of charm.",
    availability: "Available"
  },
  {
    title: "Bright 2BR Corner Unit",
    price: 3100,
    address: "10850 Strathmore Dr, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Corner unit with windows on two sides. Updated kitchen and bath, parking included.",
    availability: "Available"
  },
  {
    title: "Affordable 2BR for Students",
    price: 2700,
    address: "1755 Westwood Blvd, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.9,
    leaseDuration: "1 year",
    description: "Great value! Clean and well-maintained, perfect for 2 roommates splitting costs.",
    availability: "Available"
  },
  {
    title: "Luxury Studio with Amenities",
    price: 2100,
    address: "10920 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 0,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "High-end finishes, stainless appliances, building has pool, gym, and concierge service.",
    availability: "Available"
  },
  {
    title: "Spacious 3BR with Balconies",
    price: 4300,
    address: "634 Kelton Ave, Los Angeles, CA 90024",
    bedrooms: 3,
    distanceFromUCLA: 0.4,
    leaseDuration: "1 year",
    description: "Large unit with 2 private balconies, updated throughout, and 2 parking spaces.",
    availability: "Available"
  },
  {
    title: "Pet-Friendly 1BR",
    price: 2450,
    address: "10850 Rochester Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.6,
    leaseDuration: "1 year",
    description: "Dogs and cats welcome! Near park, hardwood floors, updated kitchen and bath.",
    availability: "Available"
  },
  {
    title: "Garden Level 2BR",
    price: 2900,
    address: "1055 Broxton Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.3,
    leaseDuration: "6 months",
    description: "Ground floor with private patio entrance. Quiet location, perfect for working from home.",
    availability: "Rented"
  },
  {
    title: "Top Floor 1BR with Views",
    price: 2700,
    address: "10960 Wilshire Blvd, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Highest floor in building, amazing sunset views, modern finishes throughout.",
    availability: "Available"
  },
  {
    title: "Furnished 2BR Short-Term",
    price: 3400,
    address: "10945 Le Conte Ave, Los Angeles, CA 90024",
    bedrooms: 2,
    distanceFromUCLA: 0.3,
    leaseDuration: "3 months",
    description: "Fully furnished including dishes and linens. Perfect for visiting scholars or short stays.",
    availability: "Available"
  },
  {
    title: "Classic Westwood 1BR",
    price: 2350,
    address: "10850 Wellworth Ave, Los Angeles, CA 90024",
    bedrooms: 1,
    distanceFromUCLA: 0.5,
    leaseDuration: "1 year",
    description: "Well-maintained older building, hardwood floors, high ceilings, controlled access.",
    availability: "Available"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if we need to create a test user
    let testUser = await User.findOne({ email: 'test@ucla.edu' });
    
    if (!testUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@ucla.edu',
        password: hashedPassword
      });
      console.log('Test user created: test@ucla.edu / password123');
    } else {
      console.log('Using existing test user');
    }

    // Clear existing listings (optional - comment out if you want to keep existing)
    // await Listing.deleteMany({});
    // console.log('Cleared existing listings');

    // Create listings
    console.log('Creating sample listings...');
    const listingsWithOwner = sampleListings.map(listing => ({
      ...listing,
      owner: testUser._id
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log(`✓ Successfully created ${sampleListings.length} listings!`);

    // Show summary
    const totalListings = await Listing.countDocuments();
    const available = await Listing.countDocuments({ availability: 'Available' });
    const pending = await Listing.countDocuments({ availability: 'Pending' });
    const rented = await Listing.countDocuments({ availability: 'Rented' });

    console.log('\n=== Summary ===');
    console.log(`Total listings in database: ${totalListings}`);
    console.log(`Available: ${available}`);
    console.log(`Pending: ${pending}`);
    console.log(`Rented: ${rented}`);
    console.log('\nTest user credentials:');
    console.log('Email: test@ucla.edu');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();