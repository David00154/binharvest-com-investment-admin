const data = require("./investments.json").table

const cb = (data, i) => {
    if (Math.random() < 0.5) {
        data["date"] = "-"
        data['status'] = false
    } else {
        data['status'] = true
    }
    return data
}
data.map(cb)
console.log(data)
