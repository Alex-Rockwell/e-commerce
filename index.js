const express = require('express')
const cookieSession = require('cookie-session')
const usersRepo = require('./repositories/users')
const authRouter = require('./routes/admin/auth.js')

const app = express()
app.use(express.urlencoded({extended:true}))
app.use(cookieSession({
  keys: ['eocd8znj24hsd8gm']
}))
app.use(authRouter)

app.listen(3000, () => {
  console.log('listening')
})


