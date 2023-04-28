const dotenv = require('dotenv')
dotenv.config();
const express = require('express');

const connectDB = require('./config/db')
const userRouter = require('./routers/userRouter')
const chatRouter = require('./routers/chatRouter')
const messageRouter = require('./routers/messageRouter')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')
const requestLoggerMiddleware = require('./middlewares/requestLogger')
const cors = require('cors');

connectDB();
const app = express();

app.use(cors())

app.use(express.json())

app.use(requestLoggerMiddleware);

app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)

app.use("/", (req,res) => {
  res.send('Hello, World')
})

app.use(notFound);
app.use(errorHandler);


const port = process.env.PORT || 5000; 
app.listen(port, () => {
  console.log('Hello, visit by http://localhost:5000')
})