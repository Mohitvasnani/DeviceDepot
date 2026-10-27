// Entrypoint: connect to Mongo and start listening. Everything else (the
// Express app, routes, middleware) lives in app.js, which the test suite
// requires directly without going through this file.
const connection = require('./database/dbConnect.js');
const app = require('./app.js');

const PORT = process.env.PORT || 8080;

connection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
