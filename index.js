const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const multer = require('multer');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yyrxfdz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // collections
        const filesCollection = client.db("seoPageDB").collection("filesCollection");

        // api's here
        // file upload api
        app.post('/upload', upload.array('files'), async (req, res) => {
            const filesData = req.files.map(file => ({
                name: file.originalname,
                extension: file.originalname.split('.').pop(),
                size: file.size,
                dateUploaded: new Date(),
            }));

            try {
                const result = await filesCollection.insertMany(filesData);
                res.json({
                    message: 'Files uploaded successfully',
                    count: result.insertedCount,
                    files: result.ops,
                });
            } catch (error) {
                console.error("Error uploading files:", error);
                res.status(500).json({ message: 'Error uploading files' });
            }
        });

        // file count api
        app.get('/file-count', async (req, res) => {
            try {
                const count = await filesCollection.countDocuments();
                res.json({ count });
            } catch (error) {
                console.error("Error fetching file count:", error);
                res.status(500).json({ message: 'Error fetching file count' });
            }
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
