const axios = require('axios')
const {Parser} = require('json2csv')
const moment = require('moment-timezone');

async function getData(code, start, end, interval){
    try{
        let url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}?symbol=${code}&period1=${start}&period2=${end}&interval=${interval}&includePrePost=true&lang=en-US&region=US&corsDomain=finance.yahoo.com`
        console.log("Calling url : ", url)
        let response = await axios.get(url)
        // console.log(response)
        let result = response.data.chart.result[0]
        let timestamp_list = result.timestamp
        if(!timestamp_list){
            return 'no_record'
        }
        let high_list = result.indicators.quote[0].high
        let low_list = result.indicators.quote[0].low
        let open_list = result.indicators.quote[0].open
        let close_list = result.indicators.quote[0].close
        let volume_list = result.indicators.quote[0].volume
    
        let stock_data = []
        for(let i = 0; i < timestamp_list.length; i++){
            if(open_list[i]){
                let timestamp = timestamp_list[i]
                let record = {
                    time : moment(new Date(timestamp * 1000)).tz('Hongkong').format(),
                    ts : timestamp,
                    high : high_list[i],
                    low : low_list[i],
                    open : open_list[i],
                    close : close_list[i],
                    volume : volume_list[i]
                }
                stock_data.push(record)
            }
        }
        return stock_data
    }catch(e){
        console.log(e)
        return 'no_record'
    }
}

module.exports = {
    getData
}