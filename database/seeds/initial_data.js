// MongoDB initial data seeding script
// Run with: mongo satellite-app seeds/initial_data.js

db = db.getSiblingDB('satellite-app');

// Clear existing data
db.users.deleteMany({});
db.satelliteimages.deleteMany({});
db.changeanalyses.deleteMany({});

// Insert sample users
const users = [
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    username: "admin",
    email: "admin@satellitenexus.com",
    password: "$2a$10$rOzZR7Ck7C7C7C7C7C7C7O", // hashed "password123"
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    username: "researcher",
    email: "researcher@example.com",
    password: "$2a$10$rOzZR7Ck7C7C7C7C7C7C7O", // hashed "password123"
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.users.insertMany(users);

// Insert sample satellite images
const images = [
  {
    _id: ObjectId("607f1f77bcf86cd799439021"),
    title: "Coastal Area January 2023",
    description: "Coastal area before storm season",
    imageUrl: "/uploads/coastal_before.jpg",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    dateTaken: new Date("2023-01-15"),
    uploadedBy: ObjectId("507f1f77bcf86cd799439011"),
    tags: ["coastal", "before", "california"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("607f1f77bcf86cd799439022"),
    title: "Coastal Area June 2023",
    description: "Coastal area after storm season",
    imageUrl: "/uploads/coastal_after.jpg",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    dateTaken: new Date("2023-06-15"),
    uploadedBy: ObjectId("507f1f77bcf86cd799439011"),
    tags: ["coastal", "after", "california"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.satelliteimages.insertMany(images);

// Insert sample change analyses
const analyses = [
  {
    _id: ObjectId("707f1f77bcf86cd799439031"),
    title: "Coastal Erosion Analysis",
    description: "Analysis of coastal erosion after storm season",
    beforeImage: ObjectId("607f1f77bcf86cd799439021"),
    afterImage: ObjectId("607f1f77bcf86cd799439022"),
    changeMap: "/uploads/change_map_1.png",
    changePercentage: 15.7,
    changeAreas: [
      {
        coordinates: [
          { lat: 34.0522, lng: -118.2437 },
          { lat: 34.0525, lng: -118.2437 },
          { lat: 34.0525, lng: -118.2430 },
          { lat: 34.0522, lng: -118.2430 }
        ],
        area: 12500,
        changeType: "erosion"
      }
    ],
    createdBy: ObjectId("507f1f77bcf86cd799439011"),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.changeanalyses.insertMany(analyses);

print("Sample data inserted successfully");