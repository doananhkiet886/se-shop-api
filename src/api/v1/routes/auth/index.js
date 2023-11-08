'use strict'

const express = require('express')
const { validateSignUp, validateSignIn } = require('~/api/v1/validations/auth.validation')
const {
  signUp,
  signIn,
  refreshToken,
  signOut
}= require('~/api/v1/controllers/auth.controller')

const router = express.Router()

router.post('/sign-up', validateSignUp, signUp)
router.post('/sign-in', validateSignIn, signIn)
router.post('/refresh-token', refreshToken)
router.post('/sign-out', signOut)

module.exports = router