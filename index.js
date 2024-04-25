require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

let phonebook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const generateId = () => {
    return Math.random()
}

app.get('/api/persons/', (request, response) => {
    Person.find({}).then(people => {
      response.json(people)
    })
  })

app.get('/info/', (request, response) => {
    const today = new Date()
    return response.send(
        `<p>Phonebook has info for ${phonebook.length} people</p><p>${today}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(contact => {
        response.json(contact)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(entry => entry.id !== id)

    return response.status(204).end()
})

app.post('/api/persons/', (request, response) => {
    const contact = request.body

    if (!(contact.name) || !(contact.number)) {
        return response.status(400).json({
            error: 'must have name and number'
        })
    } else if (phonebook.find(entry => entry.name.toLowerCase() === contact.name.toLowerCase())) {
        return response.status(400).json({
            error: 'name already exists'
        })
    } else {
        const entry = new Person({
            name: contact.name,
            number: contact.number
        })

        entry.save().then(savedEntry => {
            response.json(savedEntry)
        })
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})