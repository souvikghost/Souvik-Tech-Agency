const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connection successfull ✅");
    
  } catch (error) {
    throw new Error("DB connection failed");
  }
};
module.exports = { connectDb };