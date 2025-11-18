const mongoose = require('mongoose')
const dotenv=require('dotenv')
dotenv.config()

const connectDB = async () => {
  try {
        const db = await mongoose.connect(process.env.MONGODB_URI)
        if (db) {
            console.log("Database Connection Successfull !")
        }

    } catch (error) {
        console.log("Database Connection failed !")
        console.error("Error in db connection", error.message)
    }
};

module.exports = connectDB;
