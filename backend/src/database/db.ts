import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Connected to MongoDB");
    } catch (error){
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;