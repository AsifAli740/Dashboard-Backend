const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
const connectDB = require( "./config/connectdb")
const userRoutes =require('./routes/userRoutes')



const app = express()
const port = process.env.PORT  

const DATABASE_URL = process.env.DATABASE_URL


app.use(cors())

// database connection
connectDB(DATABASE_URL)

// JSON
app.use(express.json())

// Load routes
app.use("/api/user", userRoutes)

app.listen(port,()=>{
    console.log(`server listening at http://localhost:${port}`);
})