import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      // for matching vaid email
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please fill a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Paswored must be at least 6 charator']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: [true, 'Username already exists'],
      minlength: [3, 'Username must be at least 3 charator'],
      match: [/^[a-zA-Z0-9]+$/, 'Username must be alaphanumeric']
    },
    avator: {
      type: String
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function saveUser(next) {
  const user = this;
  user.avator = `https://robohash.org/${user.username}`;
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
