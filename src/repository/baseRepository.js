const _ = require('lodash');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

/**
 * @param {Object} model
 * @param {Object} conditions
 * @param {Object} filterQueryParams
 * @param {Object} options              { limit, page, ... }
 * @return {function(*=, *, *=): Promise<Model[]>}
 */
exports.findAll =
  (model) =>
  (conditions, filterQueryParams = {}, options = {}) => {
    const tableName = model.getTableName();
    const limit = +(options.limit === 'all' ? 0 : _.get(options, 'limit', 10));
    const offset = options.page && options.page > 0 ? limit * (options.page - 1) : 0;
    const sortBy = _.get(options, 'sortBy');
    const orderBy = _.get(options, 'orderBy', 'ASC');
    const sortOrderBy = sortBy && orderBy ? { order: [[sortBy, orderBy]] } : null;
    const otherOptions = _.omit(options, ['limit', 'offset', 'sortBy', 'orderBy']);

    // translate filterQueryParams to sequelize conditions
    // only works for AND condition for now
    const rules = [];
    _.forEach(
      filterQueryParams.rules,
      ({ field, operator, value, condition, rules: filterRules }) => {
        let sequelizeOp = null;
        let sequelizeValue = value;
        switch (operator) {
          case '=':
            sequelizeOp = Op.eq;
            break;
          case '!=':
            sequelizeOp = Op.ne;
            break;
          case '>':
            sequelizeOp = Op.gt;
            break;
          case '<':
            sequelizeOp = Op.lt;
            break;
          case '>=':
            sequelizeOp = Op.gte;
            break;
          case '<=':
            sequelizeOp = Op.lte;
            break;
          case 'CONTAINS':
            sequelizeOp = Op.like;
            sequelizeValue = `%${value}%`;
            break;
          case 'IN':
            sequelizeOp = Op.in;
            break;
          case 'NULL':
            sequelizeOp = Op.is;
            sequelizeValue = null;
            break;
          case 'BETWEEN':
            sequelizeOp = Op.between;
            sequelizeValue = value.split(' ');
            break;
          default:
            sequelizeOp = operator;
        }

        // Need to wrap the value with DATE() function
        // if want to compare date using YYYY-MM-DD format
        if (moment(sequelizeValue, 'YYYY-MM-DD', true).isValid()) {
          rules.push(
            Sequelize.where(Sequelize.fn('Date', Sequelize.col(field)), sequelizeOp, sequelizeValue)
          );
        } else if (moment(sequelizeValue, 'HH:mm:ss', true).isValid()) {
          rules.push(
            Sequelize.where(
              Sequelize.fn('date_format', Sequelize.col(field), '%H:%i:%s'),
              sequelizeOp,
              sequelizeValue
            )
          );
        } else if (moment(sequelizeValue, 'HH:mm', true).isValid()) {
          rules.push(
            Sequelize.where(
              Sequelize.fn('date_format', Sequelize.col(field), '%H:%i'),
              sequelizeOp,
              sequelizeValue
            )
          );
        } else if (moment(sequelizeValue, 'DD-MM-YYYY', true).isValid()) {
          rules.push(
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col(field), '%d-%m-%Y'),
              sequelizeOp,
              sequelizeValue
            )
          );
        } else if (moment(sequelizeValue, 'hh:mm A', true).isValid()) {
          rules.push(
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col(field), '%h:%i %A'),
              sequelizeOp,
              sequelizeValue
            )
          );
        } else if (operator === 'BETWEEN') {
          if (
            moment(`${sequelizeValue[0]} ${sequelizeValue[1]}`, 'DD-MM-YYYY HH:mmA', true).isValid()
          ) {
            // between datetime format
            const Date1 = moment(
              `${sequelizeValue[0]} ${sequelizeValue[1]}`,
              'DD-MM-YYYY HH:mmA',
              true
            ).format('YYYY-MM-DD HH:mm');
            const Date2 = moment(
              `${sequelizeValue[2]} ${sequelizeValue[3]}`,
              'DD-MM-YYYY HH:mmA',
              true
            ).format('YYYY-MM-DD HH:mm');

            const newField = field.split('.');
            if (newField.length > 1) {
              rules.push(
                Sequelize.where(
                  Sequelize.fn('DATE_FORMAT', Sequelize.col(`${field}`), '%Y-%m-%d %h:%i'),
                  sequelizeOp,
                  [Date1, Date2]
                )
              );
            } else {
              rules.push(
                Sequelize.where(
                  Sequelize.fn(
                    'DATE_FORMAT',
                    Sequelize.col(`${tableName}.${field}`),
                    '%Y-%m-%d %h:%i'
                  ),
                  sequelizeOp,
                  [Date1, Date2]
                )
              );
            }
          } else if (moment(sequelizeValue[0], 'DD-MM-YYYY', true).isValid()) {
            // between date only format
            const Date1 = moment(sequelizeValue[0], 'DD-MM-YYYY').format('YYYY-MM-DD');
            const Date2 = moment(sequelizeValue[1], 'DD-MM-YYYY').format('YYYY-MM-DD');

            const newField = field.split('.');
            if (newField.length > 1) {
              rules.push(
                Sequelize.where(
                  Sequelize.fn('DATE_FORMAT', Sequelize.col(`${field}`), '%Y-%m-%d'),
                  sequelizeOp,
                  [Date1, Date2]
                )
              );
            } else {
              rules.push(
                Sequelize.where(
                  Sequelize.fn('DATE_FORMAT', Sequelize.col(`${tableName}.${field}`), '%Y-%m-%d'),
                  sequelizeOp,
                  [Date1, Date2]
                )
              );
            }
          }
        } else if (condition) {
          const secondRules = [];
          _.forEach(
            filterRules,
            ({ field: secondField, operator: secondOperator, value: secondValue }) => {
              let secondSequelizeOp = null;
              let secondSequelizeValue = secondValue;
              switch (secondOperator) {
                case '=':
                  secondSequelizeOp = Op.eq;
                  break;
                case '!=':
                  secondSequelizeOp = Op.ne;
                  break;
                case '>':
                  secondSequelizeOp = Op.gt;
                  break;
                case '<':
                  secondSequelizeOp = Op.lt;
                  break;
                case '>=':
                  secondSequelizeOp = Op.gte;
                  break;
                case '<=':
                  secondSequelizeOp = Op.lte;
                  break;
                case 'CONTAINS':
                  secondSequelizeOp = Op.like;
                  secondSequelizeValue = `%${secondValue}%`;
                  break;
                case 'IN':
                  secondSequelizeOp = Op.in;
                  break;
                case 'NULL':
                  secondSequelizeOp = Op.is;
                  secondSequelizeValue = null;
                  break;
                case 'BETWEEN':
                  secondSequelizeOp = Op.between;
                  secondSequelizeValue = secondValue.split(' ');
                  break;
                default:
                  secondSequelizeOp = operator;
              }
              secondRules.push({
                [secondField]: { [secondSequelizeOp]: secondSequelizeValue },
              });
            }
          );

          if (condition === 'AND') {
            rules.push({ [Op.and]: secondRules });
          } else if (condition === 'OR') {
            rules.push({ [Op.or]: secondRules });
          }
        } else {
          rules.push({
            [field]: { [sequelizeOp]: sequelizeValue },
          });
        }
      }
    );

    const where = { ...conditions };
    if (where[Op.and]) {
      where[Op.and] = [...where[Op.and], ...rules];
    } else if (filterQueryParams.condition === 'OR') {
      where[Op.or] = rules;
    } else {
      where[Op.and] = rules;
    }

    return model.findAndCountAll({
      where,
      ...(limit === 0 ? {} : { limit }),
      offset,
      ...otherOptions,
      ...sortOrderBy,
    });
  };

exports.create = (model) => (data) => model.create(data);

// Create Bulk Data
exports.bulkCreate = (model) => (data) => model.bulkCreate(data);

/**
 * update by id or a set conditions
 *
 * @param {Object} model
 * @param {Object|number} conditions
 * @param {Object} data
 */
exports.update = (model) => (conditions, data) => {
  const dbCond = _.isObject(conditions) ? conditions : { id: conditions };
  return model.update(data, { where: dbCond });
};

/**
 * delete multiple records by conditions
 *
 * @param {Object} model
 */
exports.delete = (model) => (conditions) => model.destroy({ where: conditions });

/**
 * Find one by id, or by an object of conditions
 *
 * @param {Object} model
 * @param {Object|number} conditions
 * @param {Object} options
 */
exports.findOne =
  (model) =>
  (conditions, options = {}) => {
    const dbCond = _.isObject(conditions) ? conditions : { id: conditions };
    return model.findOne({ where: dbCond, ...options });
  };

/**
 * sanitize model object to API response data
 *
 * @param {Object} model
 * @return {Promise<Object>}
 */
exports.modelToResource = async (model) => model;

/**
 * sanitize API request data to model object
 *
 * @param {Object} resource
 * @return {Promise<Object>}
 */
exports.resourceToModel = async (resource) => resource;

exports.factory = (model) => ({
  findAll: exports.findAll(model),
  findOne: exports.findOne(model),
  create: exports.create(model),
  bulkCreate: exports.bulkCreate(model),
  update: exports.update(model),
  delete: exports.delete(model),
  modelToResource: exports.modelToResource,
  resourceToModel: exports.resourceToModel,
});
