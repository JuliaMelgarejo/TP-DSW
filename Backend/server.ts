import { app } from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('server running on http://localhost:' + PORT);
  console.log('Swagger UI: http://localhost:' + PORT + '/api-docs');
  console.log('Redoc docs: http://localhost:' + PORT + '/docs');
});