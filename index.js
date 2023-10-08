require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');
const { default: mongoose } = require('mongoose');

app.use(cors())
app.use(express.json())


mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI)
.then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const topicSchema = new mongoose.Schema({
    date: String,
    title: String,
    code: String

})

const Topic = mongoose.model('Topic', topicSchema)

topicSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

app.get('/api/topics', (req, res) => {
    Topic.find({}).then(topics => {
        res.json(topics)
      })
})


app.get('/api/topics/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
      const topic = await Topic.findById(id);

      if (!topic) {
          return res.status(404).json({ message: 'Object not found' });
      }

      res.json(topic);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
app.delete('/api/topics/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findByIdAndDelete(id);
    if(!topic){
      return res.status(404).send("No topic found to delete")
    }
    res.send("Topic has been deleted")
  } catch(error) {
    console.error('Error deliting topic', error)
    res.status(500).send('Error deliting topic')
  }
})
app.put('/api/topics/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { title, code } = req.body;
    
    const object = await Topic.findById(id);
    
    if (!object) {
      return res.status(404).json({ message: 'Object not found' });
    }
    object.title = title;
    object.code = code;

    await object.save();
    
    res.status(200).json({ message: 'Object updated', object });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/topics', (req, res) => {
    const body = req.body
    const topic = new Topic({
        date: body.date,
        title: body.title,
        code: body.code
    })
    topic.save()
    .then(result => {
        console.log('note saved');
        res.json(topic)
        // mongoose.connection.close()
    })
})


app.listen(port)
console.log('started on port ' + port)