import express from "express"
import dotenv from "dotenv"
import { MongoClient, ServerApiVersion } from "mongodb"

const app = express()
app.use(cors({ origin: '*' }));
dotenv.config()
const PORT = process.env.PORT || 8080
const client = new MongoClient(
  "mongodb+srv://teapotka:polina@cluster0.4wdwges.mongodb.net/?retryWrites=true&w=majority"
)
  .on("connectionCreated", () => {
    console.log("MONGODB CONNECTED")
  })
  .on("error", (e) => {
    console.log("MONGODB ERRORED " + e.message)
  })

const dbName = "kiss"
const collectionName = "values"

app.get("/", async (req, res) => {
  res.send("kiss u")
})
app.get("/elie", async (req, res) => {
  await client.connect()
  const db = client.db(dbName)
  const document = await db.collection(collectionName).findOne()
  const previous = Number.parseInt(document.elie)
  const result = await db.collection(collectionName).updateOne(
    {},
    {
      $set: { elie: previous + 1 },
    }
  )
  client.close()
  res.json(result)
})

app.get("/timi", async (req, res) => {
    await client.connect()
    const db = client.db(dbName)
    const document = await db.collection(collectionName).findOne()
    const previous = Number.parseInt(document.timi)
    const result = await db.collection(collectionName).updateOne(
      {},
      {
        $set: { timi: previous + 1 },
      }
    )
    client.close()
    res.json(result)
  })

app.get("/values", async (req, res) => {
    await client.connect()
    const db = client.db(dbName)
    const {elie, timi} = await db.collection(collectionName).findOne()
    client.close()
    res.json({elie, timi})
})

app.listen(PORT, () => {
  console.log("started at port: " + PORT)
})
