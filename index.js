require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { queryParserMw } = require('./src/middlewares/parser');

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// built in query parser for all GET routes, see the middleware for more details
app.get('*', queryParserMw);

require('./src/utils/root')(app);

app.listen(process.env.PORT, () => {
  console.log(`Awards api listening at http://localhost:${process.env.PORT}`);
});
