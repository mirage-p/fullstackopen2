require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
} else if (process.argv.length === 4) {
    console.log('contact needs a name and number')
    process.exit(1)
} else if (process.argv.length > 5) {
    console.log('put contact name in quotes')
    process.exit(1)
}

const password = process.argv[2]
const contact_name = process.argv[3]
const contact_number = process.argv[4]
const url = MONGODB_URI
mongoose.set('strictQuery', false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length === 5) {
    const person = new Person({
        name: contact_name,
        number: contact_number,
    })
    console.log(person)
    person.save().then(result => {
        console.log(`added ${contact_name} number ${contact_number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(contact => {
            console.log(`${contact.name} ${contact.number}`)
        })
        mongoose.connection.close()
    })
}