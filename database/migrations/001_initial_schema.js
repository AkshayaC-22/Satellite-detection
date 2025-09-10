// MongoDB initial migration script
// Run with: mongo satellite-app migrations/001_initial_schema.js

db = db.getSiblingDB('satellite-app');

// Create collections
db.createCollection('users');
db.createCollection('satelliteimages');
db.createCollection('changeanalyses');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.satelliteimages.createIndex({ coordinates: "2dsphere" });
db.satelliteimages.createIndex({ uploadedBy: 1 });
db.satelliteimages.createIndex({ dateTaken: 1 });

db.changeanalyses.createIndex({ beforeImage: 1 });
db.changeanalyses.createIndex({ afterImage: 1 });
db.changeanalyses.createIndex({ createdBy: 1 });
db.changeanalyses.createIndex({ isPublic: 1 });

print("Initial database schema created successfully");