import express from 'express';
import { MongoClient } from 'mongodb';
import methodOverride from 'method-override';

const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017/";

// Middleware and configuration
app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

// MongoDB connection setup
let db;

(async function () {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log('Connected to MongoDB.');
        db = client.db("fitnessTracker");

    } catch (err) {
        console.error('Error occurred while connecting to MongoDB:', err);
    }
})();

// Routes
app.get('/', (req, res) => {
    res.send(`<button ><a href="/api/workouts"> workouts </a> </button> <button ><a href="/api/workouts/add"> add workouts </a> </button> `)
});

app.get('/api/workouts', async (req, res) => {
    try {
        const collection = db.collection('workouts');
        const workouts = await collection.find({}).toArray();
        res.render("workouts", { workouts });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching from database');
    }
});

app.get('/api/workouts/add', (req, res) => {
    res.render('workoutForm.ejs');
});

app.get('/api/workouts/add/:id', (req, res) => {
    res.render('updateWorkout.ejs');
});

app.post('/api/workouts', (req, res) => {
    const { name, duration } = req.body;

    const newWorkout = {
        name,
        duration: parseInt(duration),
    };

    const collection = db.collection('workouts');
    collection.insertOne(newWorkout, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error saving to database');
            return;
        }
        console.log('Saved to database');
    });
    res.redirect('/api/workouts');
});

app.post('/api/workouts/delete/:id', async (req, res) => {
    const workoutId = parseInt(req.params.id);

    try {
        const collection = db.collection('workouts');
        await collection.deleteOne({ id: workoutId });
        res.redirect('/api/workouts/');
    } catch (err) {
        res.status(404).send(`Workout with ID ${workoutId} not found.`);
    }
});

app.post('/api/workouts/update/:id', async (req, res) => {
    const workoutId = parseInt(req.params.id);
    const updateName = req.body.name;

    try {
        const collection = db.collection('workouts');
        await collection.updateOne({ id: workoutId }, { $set: { name: updateName } });
        res.redirect('/api/workouts');
    } catch (err) {
        res.status(404).send(`Workout with ID ${workoutId} not found.`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
