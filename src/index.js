const dotenv = require('dotenv')
dotenv.config();
const express = require('express');

const connectDB = require('./config/db')
const userRouter = require('./routers/userRouter')
const chatRouter = require('./routers/chatRouter')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')

connectDB();
const app = express();

app.use(express.json())


app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)

app.use("/", (req,res) => {
  res.send('Hello, World')
})

app.use(notFound);
app.use(errorHandler);


const port = process.env.PORT || 5000; 
app.listen(port, () => {
  console.log('Hello, visit by http://localhost:5000')
})