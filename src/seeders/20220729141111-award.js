'use strict';
const { AWARD_TYPE } = require('../constants');
const moment = require('moment');

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      'Awards',
      [
        {
          title: 'Gift Card IDR 1.000.000',
          poin: 500000,
          imageUrl: '1.jpg',
          type: AWARD_TYPE.VOUCHERS,
          createdAt: moment().format('YYYY-MM-DD'),
          updatedAt: moment().format('YYYY-MM-DD'),
        },
        {
          title: 'Gift Card IDR 500.000',
          poin: 250000,
          imageUrl: '2.jpg',
          type: AWARD_TYPE.VOUCHERS,
          createdAt: moment().format('YYYY-MM-DD'),
          updatedAt: moment().format('YYYY-MM-DD'),
        },
        {
          title: 'Old Fashion Cake',
          poin: 100000,
          imageUrl: '3.jpg',
          type: AWARD_TYPE.PRODUCTS,
          createdAt: moment().format('YYYY-MM-DD'),
          updatedAt: moment().format('YYYY-MM-DD'),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Awards', null, {});
  },
};
