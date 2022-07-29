const bodyParser = require('body-parser');
const cors = require('cors');

const { queryParserMw } = require('../middlewares/parser');
const router = require('../routes');

module.exports = (app) => {
  app.use(cors());
  app.use(bodyParser.json());

  // built in query parser for all GET routes, see the middleware for more details
  app.get('*', queryParserMw);
  app.use(router);
};
