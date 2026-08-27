import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from '@angular/ssr/node';
import { createServer } from 'node:http';

const angularApp = new AngularNodeAppEngine();

const reqHandler = createNodeRequestHandler(async (req, res) => {
  const response = await angularApp.handle(req);

  if (response) {
    await writeResponseToNodeResponse(response, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

export default reqHandler;

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);

  const server = createServer(reqHandler);

  server.listen(port, () => {
    console.log(`Angular SSR running at http://localhost:${port}`);
  });
}