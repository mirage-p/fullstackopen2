const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status : res[content-length] - :response-time ms :data'))

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
    return response.json(phonebook)
})

app.get('/info/', (request, response) => {
    const today = new Date()
    return response.send(
        `<p>Phonebook has info for 2 people</p><p>${today}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const contact = phonebook.find(entry => entry.id === id)
    if (contact) {
        return response.json(contact)
    } else {
        return response.status(404).end()
    }
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
        const entry = {
            name: contact.name,
            number: contact.number,
            id: generateId()
        }

        phonebook.concat(entry)
        response.json(entry)
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})