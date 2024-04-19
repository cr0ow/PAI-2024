var express = require('express')
var router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('projekt1.bd')
const week = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']

router.get('/', (req, res) => {
  db.all("SELECT * FROM THINGS ORDER BY NAME", (err, rows) => {
    var items = []
    rows.forEach((row) => items.push(row))
    res.render('index', { title: 'Rezerwacje', items: items })
  })
})

router.get('/bookings/:id/', (req, res) => {
  db.all("SELECT * FROM BOOKINGS WHERE ID_THING = " + req.params.id, (err, rows) => {
    let data = { bookings: [], weekDays: [], weeks: []}
    let bookings = []
    let id = 0
    let today = new Date()
    today.setHours(today.getHours() + 1)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    for(let i = 7; i < 24; i++) {
      let days = 0;
      bookings.push({ hour: i, data: [] })
      let tempData = []
      while(days < 14) {
        day = (today.getDate() + days) % 7
        let temp = new Date(today)
        temp.setDate(today.getDate() + days)
        temp.setHours(i)
        tempData.push({ id: id++, weekDay: week[(day) % 7], dayNumber: days, hour: i, date: temp, whoBooked: null })
        days++;
      }
      bookings[i - 7].data = tempData
    }

    let weekDays = []
    let currentDayOfWeek = today.getDay()
    for(let i = currentDayOfWeek; i < currentDayOfWeek + 14; i++) {
      let temp = new Date(today)
      temp.setDate(temp.getDate() + i - currentDayOfWeek)
      weekDays.push({ day: week[i % 7], date: formatDate(new Date(temp)) })
    } 

    let toUpdate = []
    rows.forEach((row_) => {
      let startDate = parseTimestamp(row_.BOOKING_START)
      let finishDate = parseTimestamp(row_.BOOKING_FINISH)
      let dates = []

      let currentDate = startDate
      while(currentDate.toString() != finishDate.toString()) {
        dates.push(new Date(currentDate))
        currentDate.setHours(currentDate.getHours() + 1)
      }

      let datesAsStrings = dates.map(it => it.toString())
      bookings.forEach(it => {
          it.data.forEach(item => {
            if(datesAsStrings.includes(item.date.toString())) {
              item.whoBooked = row_.WHO_BOOKED
              item.hour = item.date.getHours() - 1
              let bookingIdx = it.hour - 7
              let dataIdx = bookings[bookingIdx].data.indexOf(item)
              toUpdate.push({ bookingIdx: bookingIdx, dataIdx: dataIdx, dataItem: item })
            }
          })
      })
    })
    toUpdate.forEach(it => {
      bookings[it.bookingIdx].data[it.dataIdx] = it.dataItem
    })

    data.bookings = bookings
    data.weekDays = weekDays

    db.get("SELECT * FROM THINGS WHERE ID = ?", req.params.id, (err_, thing) => {
      res.render('bookings', { thing: thing, data: data})
    })
  })
})

router.post('/booking-confirmation', (req, res) => {
  let body = req.body
  let bookings = JSON.parse(body.bookings)
  let toInsert = []
  let toDisplay = []

  bookings.forEach(booking => {
    booking.hours.sort((a, b) => a - b)
    let hours = [ booking.hours[0] ]
    for(let i = 0; i < booking.hours.length - 1; i++) {
      if(booking.hours[i] + 1 == booking.hours[i + 1]) {
        hours.push(booking.hours[i + 1])
      }
      else {
        let dates = parseToTimestamp(booking.day, hours)
        toInsert.push({ idThing: body.thingId, start: dates[0], finish: dates[1], whoBooked: body.name + ' ' + body.surname })
        hours = [ booking.hours[i + 1] ]
      }
    }
    let dates = parseToTimestamp(booking.day, hours)
    toInsert.push({ idThing: body.thingId, start: dates[0], finish: dates[1], whoBooked: body.name + ' ' + body.surname })
  })

  let insertQuery = 'INSERT INTO BOOKINGS(ID, ID_THING, BOOKING_START, BOOKING_FINISH, WHO_BOOKED) VALUES (NULL, :idThing, :bookingStart, :bookingFinish, :whoBooked)'
  toInsert.forEach(it => {
    db.run(insertQuery, it.idThing, it.start, it.finish, it.whoBooked)
    let date = new Date(parseInt(it.start.substring(0, 4)), parseInt(it.start.substring(5, 7)), parseInt(it.start.substring(8, 10)), parseInt(it.start.substring(11, 13)), 0, 0, 0)
    date.setMonth(date.getMonth() - 1)
    toDisplay.push({ date: formatDate(new Date(date)), weekDay: week[date.getDay()], hours: it.start.substring(11, 13) + ':00 - ' + it.finish.substring(11, 13) + ':00' })
  })

  res.render('confirmation', {name: body.name + ' ' + body.surname, bookings: toDisplay})
})

router.get('/err', (req, res) => {
  res.render('error', { message: 'message', error: { status: 333, stack: 'stack' } })
})

function parseTimestamp(timestamp) {
  timestamp = timestamp.replace(' ', 'T')
  let parts = timestamp.split('T')
  let hours = parseInt(timestamp.substring(11, 13))
  if(hours < 10) {
    hours = '0' + hours
  }
  parts[1] = hours + parts[1].substring(2)
  return new Date(parts.join('T'))
}

function parseToTimestamp(data, range) {
  let currentYear = new Date()
  let dayMonth = data.split('.')
  if(parseInt(range[0]) < 10) {
    range[0] = '0' + range[0]
  }
  let start = currentYear.getFullYear() + '-' + dayMonth[1] + '-' + dayMonth[0] + ' ' + range[0] + ':00:00'

  if(parseInt(range[range.length - 1]) + 1 < 10) {
    range[range.length - 1] = '0' + (parseInt(range[range.length - 1]) + 1)
  }
  else {
    range[range.length - 1] = parseInt(range[range.length - 1]) + 1
  }
  let finish = currentYear.getFullYear() + '-' + dayMonth[1] + '-' + dayMonth[0] + ' ' + range[range.length - 1] + ':00:00'
  
  return [ start, finish ]
}

function formatDate(date) {
  let day = date.getDate()
  if(day < 10) {
    day = '0' + day
  }
  let month = date.getMonth() + 1
  if(month < 10) {
    month = '0' + month 
  }
  return day + '.' + month
} 

module.exports = router
