const express = require('express')
const app = express()
const usersRoutes = require('./routes/users')
const adminRoutes = require('./routes/admin')
const notesRoutes = require('./routes/notes')
require('./config/database')

const cookieParser = require('cookie-parser')
app.use(cookieParser());



const port = 3000
app.use(express.json())



app.use('/user', usersRoutes)
app.use('/admin', adminRoutes)
app.use('/notes', notesRoutes)


app.listen(port, () => console.log(`O servidor está rodando --> http://localhost:${port}`))