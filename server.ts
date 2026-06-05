import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { initSocketServer } from './server/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname: '0.0.0.0', port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  initSocketServer(io);

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`\n> Servidor Maruja listo en http://localhost:${port}`);
    console.log(`> Votantes:  http://localhost:${port}/vote`);
    console.log(`> Admin DJ:  http://localhost:${port}/admin`);
    console.log(`> Display:   http://localhost:${port}/display\n`);
  });
});
