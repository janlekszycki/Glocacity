
module.exports = async function (coordinates) {
    const data = await fetch(`http://api.weatherapi.com/v1/current.json?key=94899f3b18314b0d9d960014232309&q=${coordinates[1]},${coordinates[0]}&aqi=no`)
    const result = await data.json()
    return result;
}


