import express from "express"
import dotenv from "dotenv"
import { MongoClient, ServerApiVersion } from "mongodb"
import cors from "cors"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const DB_NAME = "kiss"
const COLLECTION_NAME = "values"

const client = new MongoClient(
  "mongodb+srv://teapotka:polina@cluster0.4wdwges.mongodb.net/?retryWrites=true&w=majority"
)
  .on("connectionCreated", () => {
    console.log("MONGODB CONNECTED")
  })
  .on("error", (e) => {
    console.log("MONGODB ERRORED " + e.message)
  })

async function connectToDatabase() {
  try {
    await client.connect()
    console.log("Connected to the database")
    return client.db(DB_NAME)
  } catch (error) {
    console.error("Database connection error: ", error)
    throw error
  }
}

app.use(async (req, res, next) => {
  req.db = await connectToDatabase()
  next()
})

app.use(cors({ origin: "*" }))
app.use(express.json())

app.get("/", async (req, res) => {
  res.send("kiss u")
})

app.get("/values", async (req, res) => {
  try {
    const { db, query } = req
    const { name } = query

    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const session = client.startSession()
    session.startTransaction()
    try {
      const collection = db.collection(COLLECTION_NAME)
      const document = await collection.findOne({name: name},{ session })

      await session.commitTransaction()
      session.endSession()
      res.json(document)
    } catch (error) {
      session.abortTransaction()
      session.endSession()
      console.error("Error in /values route:", error)
      res.status(500).json({ error: "Session Error" })
    }
  } catch (error) {
    console.error("Error in /values route:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.post("/kiss", async (req, res) => {
  try {
    const { body, db } = req
    const { name } = body
    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const session = client.startSession()
    session.startTransaction()

    try {
      const collection = db.collection(COLLECTION_NAME)
      const result = await collection.updateOne(
        { name: name },
        {
          $inc: { value: 1 },
        },
        { session }
      )
      const document = await collection.findOne({ name: name }, { session })
      await session.commitTransaction()
      session.endSession()

      res.json({ result, document })
    } catch (error) {
      session.abortTransaction()
      session.endSession()
      console.error("Error in /kiss route:", error)
      res.status(500).json({ error: "Session Error" })
    }
  } catch (error) {
    console.error("Error in /kiss route:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.listen(PORT, () => {
  console.log("started at port: " + PORT)
})