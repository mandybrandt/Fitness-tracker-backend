const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
// const { token } = require("morgan");
const { JWT_SECRET } = process.env;

// const token = require('bcrypt');
// const usersRouter = require('../../FitnessTracker/api/users');
const { createUser, getUserByUsername, getUserById, getPublicRoutinesByUser } = require('../db.users');
// const {getPublicRoutinesByUser} = require('../db.routines')

usersRouter.use((feq, res, next )=> {
  console.log("A request has been made to /users");

  next();
})

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please suppy both a username and password"
    });
  }
  
  try {
    const user = await getUserByUsername(username, password);
    const token = jwt.sign(user, process.env.JWT_SECRET);

    // const SALT_COUNT = 10;
    // const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    if (!user) {
      res.send({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });

    } else {
      next({
        message: "you're logged in!", 
        token: token

      });
    }
  } catch ({ name, message }) {
    ({ name, message });
  }
});

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);
    // const SALT_COUNT = 10;
    // const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    if (_user) {
      throw new Error({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      })
    }

    
    if (password.length < 8) {
      throw new Error({
        name: "PasswordLengthError",
        password: "Password must be at least 8 characters"
      })
    }

    const user = await createUser({username, password});

    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: "thank you for signing up",
      user,
      token,
    });
  } catch ({ name, message }) {
    next({ name, message })
  }
});





// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  const prefix = "Bearer";
  const auth = req.header("Authorization");
  // const { username } = req.params;
  try {
    if(!auth) {
      res.sendStatus(401);
      } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length)
        const { id } = jwt.verify(token, JWT_SECRET);

        if (id) {
          req.user = await getUserById(id);
          res.send(req.user);
        }
      }
    } catch (error) {
      next(error);
    }
});
  

// GET /api/users/:username/routines
usersRouter.get('/:username/routines', async (req, res, next) => {
  const {username} = req.params;

  try{
    const routine = await getPublicRoutinesByUser( {username} );
    if(routine) {
      res.send(routine);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
