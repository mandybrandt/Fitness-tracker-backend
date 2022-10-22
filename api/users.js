const express = require('express');
const router = express.Router();
// took from juicebox
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usersRouter = require('../../FitnessTracker/api/users');
const { getAllUsers, createUser, getUserByUsername } = require('../db.users')
const {getPublicRoutinesByUser} = require('../db.routines')



// POST /api/users/login
//from juicebox; no hashed password
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please suppy both a username and password"
    });
  }
  //juicebox put in id: 1 and username: 'albert' not sure what we need for this
  const token = jwt.sign({ id: 1, username: 'albert' }, process.env.JWT_SECRET);

  try {
    const user = await getUserByUsername(username, password);
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    if (!user && !user.password == hashedPassword) {
      res.send({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });

    } else {
      next({
        message: "you're logged in!", token

      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST /api/users/register
// from juicebox; did not hash password, took out name and location; added password.length if statement
usersRouter.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({username, hashedPassword});

    if (password.length < 8) {
      next({
        password: "Password must be at least 8 characters"
      });
    }

    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: "thank you for signing up",
      token
    });
  } catch ({ name, message }) {
    next({ name, message })
  }
});





// GET /api/users/me
// from juicebox usersRouter.get to start. Created const userData... myself
usersRouter.get('/users', async (req, res, next) => {
  const { username } = req.params;
  try {
    const token = jwt.sign({username}, process.env.JWT_SECRET, {expiresIn:'1w'});
    const currentUser = await getAllUsers({username,token});
      if(!token) {
        next({
          message: "Invalid credentials"
        })
        res.send({currentUser})
      } 
    } catch (error) {
        next(error);
      }
});
  

// GET /api/users/:username/routines
// used usersRouter.get from juicebox users.js as a start
usersRouter.get('/:username/routines', async (req, res, next) => {
  const {username} = req.params;
  try{
    const userRoutines = await getPublicRoutinesByUser(username);
    if(!username) {
      next({
        username: "username does not exist",
        routines: "public routines do not exist",
        message: "There are no public routines for this user"
      });
      res.send(userRoutines)
    }
  } catch ({message}) {
    return (username)
  }
});

module.exports = router;
