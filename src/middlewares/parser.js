const { FQP } = require('filter-query-parser');

exports.queryParserMw = (req, res, next) => {
  req.filterQueryParams = req.query.filters ? FQP.parser(req.query.filters) : {};
  next();
};
