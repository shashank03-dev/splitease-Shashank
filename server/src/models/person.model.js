import mongoose from 'mongoose'

const MAX_NAME_LENGTH = 80

// Case-insensitive comparison so "Aman" and "aman" are the same person.
const PERSON_NAME_COLLATION = Object.freeze({ locale: 'en', strength: 2 })

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [
        MAX_NAME_LENGTH,
        `Name must be at most ${MAX_NAME_LENGTH} characters.`,
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// The unique index is the final guard against duplicates, including under
// concurrent requests. The controller also checks first for a friendly error.
personSchema.index(
  { name: 1 },
  { unique: true, collation: PERSON_NAME_COLLATION },
)

const Person = mongoose.model('Person', personSchema)

export default Person
export { MAX_NAME_LENGTH, PERSON_NAME_COLLATION }
