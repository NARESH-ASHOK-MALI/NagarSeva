// init/index.js
require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Authority = require('../models/authority.js');

const dbUrl = "mongodb://127.0.0.1:27017/NagarSeva"; // Local MongoDB

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  // 1. Clear all existing data
  await Listing.deleteMany({});
  await User.deleteMany({});
  await Authority.deleteMany({});
  console.log("Existing data deleted");

  // 2. Create multiple dummy users
  const userCredentials = [
    { username: 'admin1', email: 'admin1@example.com', password: 'password123', role: 'admin' },
    { username: 'admin2', email: 'admin2@example.com', password: 'password123', role: 'admin' },
    { username: 'sampleuser', email: 'user1@example.com', password: 'password123', role: 'user' },
    { username: 'testuser1', email: 'user2@example.com', password: 'password123', role: 'user' },
    { username: 'testuser2', email: 'user3@example.com', password: 'password123', role: 'user' },
    { username: 'testuser3', email: 'user4@example.com', password: 'password123', role: 'user' },
  ];

  const createdUsers = [];
  for (let cred of userCredentials) {
    const user = new User({ username: cred.username, email: cred.email, role: cred.role });
    const registeredUser = await User.register(user, cred.password);
    createdUsers.push(registeredUser);
    console.log(`Dummy user created: ${registeredUser.username}`);
  }

  // 3. The first user will be the author of all listings
  const owner = createdUsers[0];

  // 4. Add author and random reports to each listing
  // Authorities
  const authoritiesSeed = [
    { name: 'Pune Municipal Corporation - Water Dept', city: 'Pune' },
    { name: 'Pune Municipal Corporation - Sanitation', city: 'Pune' },
    { name: 'Mumbai Municipal - Roads', city: 'Mumbai' },
    { name: 'Delhi Jal Board', city: 'Delhi' },
  ];
  const authorities = await Authority.insertMany(authoritiesSeed);
  console.log(`Created ${authorities.length} authorities`);

  // Listings with GeoJSON, address, tracking
  const statuses = ['Pending Verification','Verified','Assigned to Authority','Work in Progress','Resolved'];
  const listingsWithData = initData.map((obj, idx) => {
    const lng = 73.8567 + (Math.random() - 0.5) * 0.2;
    const lat = 18.5204 + (Math.random() - 0.5) * 0.2;
    const trackLen = 1 + Math.floor(Math.random() * statuses.length);
    const tracking = [];
    for (let i=0;i<trackLen;i++) {
      tracking.push({ status: statuses[i], updatedAt: new Date(Date.now() - (trackLen - i) * 86400000) });
    }
    const assigned = tracking.find(t => t.status === 'Assigned to Authority') ? authorities[0].name : undefined;
    const newListing = {
      title: obj.title,
      description: obj.description,
      image: obj.image,
      date: obj.date,
      city: obj.city,
      address: obj.address,
      location: { type: 'Point', coordinates: [lng, lat] },
      author: owner._id,
      tracking,
      assignedAuthority: assigned
    };
    // Random reports
    const reports = new Set();
    const numReports = Math.floor(Math.random() * createdUsers.length);
    for (let i = 0; i < numReports; i++) {
      const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
      reports.add(createdUsers[randomUserIndex]._id);
    }
    newListing.reports = Array.from(reports);
    return newListing;
  });

  // 5. Insert the new listings into the database
  await Listing.insertMany(listingsWithData);
  console.log("Data was initialized with a default owner and sample reports.");
  
  mongoose.connection.close();
};