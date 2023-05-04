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
const server = app.listen(port, () => {
  console.log('Hello, visit by http://localhost:5000')
})

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173"
  }
});

io.on('connection', (socket) => {
  console.log('connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id)
    socket.emit('connected.')
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room)
  })

  socket.on('new message', (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if(!chat.users) return console.log('Chat.user not defined');
    
    chat.users.forEach(user => {
      if(user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived)
    })
  })
})
