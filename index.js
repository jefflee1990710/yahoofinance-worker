const axios = require('axios')
const {Parser} = require('json2csv')
const moment = require('moment-timezone');
const fs = require('fs');

const fields = ['time', 'high', 'low', 'open', 'close', 'volume']
const json2csvParser = new Parser({ fields });

async function getData(code, start, end, interval){
    let response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${code}?symbol=${code}&period1=${start}&period2=${end}&interval=${interval}&includePrePost=true&events=div%7Csplit%7Cearn&lang=en-US&region=US&crumb=QkZltM8FmLq&corsDomain=finance.yahoo.com`
    )
    let result = response.data.chart.result[0]
    let timestamp_list = result.timestamp
    if(!timestamp_list){
        return null
    }
    let high_list = result.indicators.quote[0].high
    let low_list = result.indicators.quote[0].low
    let open_list = result.indicators.quote[0].open
    let close_list = result.indicators.quote[0].close
    let volume_list = result.indicators.quote[0].volume

    let stock_data = []
    for(let i = 0; i < timestamp_list.length; i++){
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
    return stock_data
}

async function downloadData(code, interval, dayStr){
    let startDay = new Date(dayStr + " 09:00:00+08:00")
    let endDay = new Date(dayStr + " 16:00:00+08:00")
    let data = await getData(code, startDay.getTime()/1000, endDay.getTime()/1000, interval)
    if(data.length > 0){
        let csv = json2csvParser.parse(data);
        fs.writeFileSync(`./data/stock_${code}_${dayStr}_${interval}.csv`, csv)
    }else{
        throw new Error('No Data')
    }
}

(async () => {
    let nDayBack = 30
    let today = moment()

    let codeList = ['2362.HK', '0700.HK', '^HSI']
    let intervalList = ['1m', '5m', '15m']

    for(let c = 0; c < codeList.length; c ++){
        let stockCode = codeList[c]

        for(let a = 0 ; a < intervalList.length; a++){
            let interval = intervalList[a]
            
            for(let i = 0 ; i < nDayBack; i ++){
                let day = today.clone().subtract(i, "days")
                console.log('Downloading data of ' + day.format('YYYY-MM-DD') + '...')
                try{
                    await downloadData(stockCode, interval, day.format('YYYY-MM-DD'))
                }catch(e){
                    console.log(`Data download fail for ${day.format('YYYY-MM-DD')}`)
                }
            }
        }
    }
})().catch((err) => {
    console.log(err)
})
