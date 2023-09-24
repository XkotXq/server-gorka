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


app.get('/api/topics/:id', (req, res) => {
    const id = Number(req.params.id)
    const topic = topics.find(topic => topic.id === id)
    res.json(topic)
})
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