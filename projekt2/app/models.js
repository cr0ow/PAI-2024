const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite:projekt2.db');

class Thing extends Model {}

Thing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    keeperName: {
        type: DataTypes.STRING
    },
    keeperPhoneNumber: {
        type: DataTypes.STRING
    },
    keeperRoom: {
        type: DataTypes.STRING
    }
  },
  {
    sequelize,
    modelName: 'Thing',
  },
);

class Booking extends Model {}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    bookingStart: {
      type: DataTypes.TIME,
      allowNull: false
    },
    bookingFinish: {
      type: DataTypes.TIME,
      allowNull: false
    },
    whoBooked: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Booking',
  },
);

Thing.hasMany(Booking);
Booking.belongsTo(Thing);

(async () => {
  await sequelize.sync({ force: true });

  Thing.create({name: 'Sala G-1-09', description: 'Sala komputerowa z 20-ma stanowiskami', keeperName: '-', keeperPhoneNumber: '-', keeperRoom: '-'});
  Thing.create({name: 'Rzutnik cyfrowy', description: 'Rzutnik o rozdzielczości Full HD', keeperName: 'Jan Kowalski', keeperPhoneNumber: '123 456 789', keeperRoom: 'G-1-1'});
  Thing.create({name: 'Stół do tenisa stołowego', description: 'Stół na 1. piętrze w budynku G', keeperName: 'Jan Kowalski', keeperPhoneNumber: '123 456 789', keeperRoom: 'G-1-1'});

  Booking.create({ThingId: 1, bookingStart: new Date('2024-04-17T12:00:00Z'), bookingFinish: new Date('2024-04-17T14:00:00Z'), whoBooked: 'Anna Nowak'})
})();

module.exports = { Thing, Booking }