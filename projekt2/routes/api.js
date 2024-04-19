var express = require('express')
var apiRouter = express.Router()
const models = require('../app/models')

apiRouter.get('/things', async (req, res) => {
    await models.Thing.findAll()
    .then(result => {
        res.status(200).json(result.map(thing => toThingDto(thing)))
    })
    .catch(error => {
        res.status(500).json({message: "Error while getting list of things: " + error})
    })
})

apiRouter.get('/things/:thingId', async (req, res) => {
    await models.Thing.findByPk(req.params.thingId)
    .then(result => {
        res.status(200).json(toThingDto(result))
    })
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + req.params.thingId + " not found"})
    })
})

apiRouter.post('/things', async (req, res) => {
    await models.Thing.create(JSON.parse(req.body))
    .then(result => {
        res.status(201).json(toThingDto(result))
    })
    .catch(error => {
        res.status(400).json({message: "Error while saving Thing entity: " + error})
    })
})

apiRouter.put('/things/:thingId', async (req, res) => {
    let thingId = req.params.thingId;
    await models.Thing.findByPk(thingId)
    .then(async (result) => {
        thingData = req.body;
        result.name = thingData.name || result.name;
        result.description = thingData.description || result.description;
        result.keeperName = thingData.keeperName || result.keeperName;
        result.keeperPhoneNumber = thingData.keeperPhoneNumber || result.keeperPhoneNumber;
        result.keeperRoom = thingData.keeperRoom || result.keeperRoom;
        await models.Thing.update(thingData, { where: { id: thingId }})
        .then(() => {
            res.status(200).json(toThingDto(result));
        })
        .catch(error => {
            res.status(400).json({message: "Error while updating Thing entity: " + error});
        })
    })
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + thingId + " not found"});
    })
})

apiRouter.delete('/things/:thingId', async (req, res) => {
    await models.Thing.findByPk(req.params.thingId)
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + req.params.bookingId + " not found"})
    })
    await models.Thing.destroy({ where: {id: req.params.thingId}})
    .then(() => {
        res.status(204).json()
    })
    .catch(error => {
        res.status(500).json({message: "Error while deleting Thing entity: " + error})
    })
})

apiRouter.get('/things/:thingId/bookings', async (req, res) => {
    await models.Booking.findAll({ where: {ThingId: req.params.thingId}})
    .then(result => {
        res.status(200).json(result.map(booking => toBookingDto(booking)))
    })
})

apiRouter.get('/things/:thingId/bookings/:bookingId', async (req, res) => {
    let bookingId = req.params.bookingId
    let thingId = req.params.thingId
    await models.Booking.findByPk(bookingId)
    .then(result => {
        if(result.ThingId != thingId) {
            res.status(400).json({message: "Booking with id=" + bookingId + " does not does not contain Thing with id=" + thingId})
        }
        res.status(200).json(toBookingDto(result))
    })
    .catch(error => {
        res.status(404).json({message: "Booking with id=" + bookingId + " not found: "})
    })
})

apiRouter.post('/things/:thingId/bookings', async (req, res) => {
    let booking = req.body;
    let thingId = req.params.thingId;
    await models.Thing.findByPk(thingId)
    .then(async () => {
        booking.ThingId = thingId;
        await models.Booking.create(booking)
        .then(result => {
            res.status(201).json(toBookingDto(result));
        })
        .catch(error => {
            res.status(400).json({message: "Error while saving Booking entity: " + error});
        })
    })
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + thingId + " not found"});
    })
})

apiRouter.put('/things/:thingId/bookings/:bookingId', async (req, res) => {
    let bookingData = req.body;
    let bookingId = req.params.bookingId;
    let thingId = req.params.thingId;
    await models.Thing.findByPk(thingId)
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + thingId + " not found"});
    })
    await models.Booking.findByPk(bookingId)
    .then(async (result) => {
        result.bookingStart = bookingData.bookingStart || result.bookingStart;
        result.bookingFinish = bookingData.bookingFinish || result.bookingFinish;
        result.whoBooked = bookingData.whoBooked || result.whoBooked;
        await models.Booking.update(bookingData, { where: {id: bookingId} })
        .then(() => {
            res.status(200).json(result);
        })
        .catch(error => {
            res.status(500).json({message: "Error while updating booking: " + error});
        })
    })
    .catch(() => {
        res.status(404).json({message: "Booking with id=" + bookingId + " not found"});
    })
})

apiRouter.delete('/things/:thingId/bookings/:bookingId', async (req, res) => {
    let bookingId = req.params.bookingId
    let thingId = req.params.thingId
    await models.Thing.findByPk(thingId)
    .catch(() => {
        res.status(404).json({message: "Thing with id=" + thingId + " not found"})
    })
    await models.Booking.findByPk(bookingId)
    .catch(() => {
        res.status(404).json({message: "Booking with id=" + bookingId + " not found"})
    })
    await models.Booking.destroy({ where: { id: bookingId }})
    .then(() => {
        res.status(204).json()
    })
    .catch(error => {
        res.status(500).json({message: "Error while deleting Booking entity: " + error})
    })
})

function toThingDto(thingModel) {
    return {
        id: thingModel.id,
        name: thingModel.name,
        description: thingModel.description,
        keeperName: thingModel.keeperName,
        keeperPhoneNumber: thingModel.keeperPhoneNumber,
        keeperRoom: thingModel.keeperRoom
    }
}

function toBookingDto(bookingModel) {
    let start = new Date(bookingModel.bookingStart)
    start.setHours(start.getHours() - 2)
    let finish = new Date(bookingModel.bookingFinish)
    finish.setHours(finish.getHours() - 2)
    return {
        id: bookingModel.id,
        thingId: bookingModel.ThingId,
        bookingStart: start.toLocaleString(),
        bookingFinish: finish.toLocaleString(),
        whoBooked: bookingModel.whoBooked
    }
}

module.exports = apiRouter