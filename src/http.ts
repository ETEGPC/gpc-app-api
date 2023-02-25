import express from 'express';
import routes from './routes/routes';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import notificationsRoutes from './routes/notificationsRoutes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors({
  origin: '*'
}));
app.use(express.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(routes);
app.use(notificationsRoutes)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// app.get('/teste', async (req, res) => {
//   sendEmail('Sla', 'clovischakrian26@gmail.com', 'saçodaçsdj').then(resp => {
//     return res.status(200).json(resp);
//   })
// })

export { server, io }