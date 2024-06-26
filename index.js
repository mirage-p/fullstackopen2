require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
const Person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());

morgan.token('data', (req, res) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.get('/info/', (request, response) => {
  const today = new Date();
  Person.collection.countDocuments({}, (err, count) => {
    if (err) {
      return response.status(500).send({ error: 'An error occurred while fetching the data' });
    }
    return response.send(`<p>Phonebook has info for ${count} people</p><p>${today}</p>`);
  });
});

app.get('/api/persons/', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((contact) => {
      if (contact) {
        response.json(contact);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons/', (request, response, next) => {
  const contact = request.body;

  const entry = new Person({
    name: contact.name,
    number: contact.number,
  });

  entry.save()
    .then((savedEntry) => {
      response.json(savedEntry);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const contact = request.body;

  const person = {
    name: contact.name,
    number: contact.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
