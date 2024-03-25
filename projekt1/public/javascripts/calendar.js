const ids = []
const bookings = []
const yellow = '#fcba03'
const white = '#ffffff'
var name_ = false
var surname_ = false
var anythingBooked_ = false

function checkButton() {
    let submit = document.getElementById('confirmBooking')
    if(name_ && surname_ && anythingBooked_) {
        submit.disabled = false
        submit.classList.remove('buttonDisabled')
    }
    else {
        submit.disabled = true
        submit.classList.add('buttonDisabled')
    }
}

function validateTextField(input) {
    const regex = /^[A-ZŁŚŹŻ][a-ząćęłńóśźż' ]*(-[A-ZŁŚŹŻ][a-ząćęłńóśźż' ]*)?$/;
    let inputValue = input.value
    let result = inputValue.length != 0 && regex.test(inputValue)
    if(input.name == 'name') {
        name_ = result
    }
    else if(input.name == 'surname') {
        surname_ = result
    }
    checkButton()
}

function changeStatus(id) {
    let cell = document.getElementById(id)
    if(ids.includes(id)) {
        ids.pop(id)
        cell.style.backgroundColor = white
        cell.innerHTML = ""
    }
    else {
        ids.push(id)
        cell.style.backgroundColor = yellow
        cell.innerHTML = "Wybrano"
    }
    updateTable(id)
    if(ids.length != 0) {
        anythingBooked_ = true
    }
    else {
        anythingBooked_ = false
    }
    checkButton()
}

function updateTable(id) {
    let cellName = document.getElementById(id).attributes.name.value
    let props = cellName.split(';')
    let day = bookings.find(it => it.day == props[0])
    if(day == undefined) {
        bookings.push({ day: props[0], hours: [parseInt(props[1])] })
    }
    else {
        let idx = bookings.indexOf(day)
        let hourIdx = bookings[idx].hours.indexOf(parseInt(props[1]))
        if(hourIdx !== -1) {
            bookings[idx].hours.splice(hourIdx, 1)
            if(bookings[idx].hours.length === 0) {
                bookings.splice(idx, 1)
            }
        }
        else {
            bookings[idx].hours.push(parseInt(props[1]))
        }
    }
    const input = document.getElementById('bookings')
    input.setAttribute('value', JSON.stringify(bookings))
}
