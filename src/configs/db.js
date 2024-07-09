import mongoose from "mongoose";
import chalk from "chalk";
const connectDB = async () => {
  try {
    // const options = {
    //   useNewUrlParser: false,
    //   useUnifiedTopology: false,
    //   serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // };
    const uri = process.env.MONGO_URI || "mongodb://localhost/bags-ecommerce";
    await mongoose
      .connect(uri)
      .catch((error) => console.log(error))
      .then(() => {
        console.log(chalk.bgMagentaBright("MONGODB CONNECTED SUCCESSFULLY!"));
      });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default connectDB;
