const moment = require('moment-timezone')
const fs = require('fs');
const {Parser} = require('json2csv')
const _ = require('underscore')

const fields = ['time', 'high', 'low', 'open', 'close', 'volume']
const json2csvParser = new Parser({ fields });

const {getDb} = require('./src/db')
const {getData} = require('./src/yahoo')

let codeList = ['2362.HK', '0700.HK', '^HSI']
let intervalList = ['5m', '1m', '15m']
// let codeList = ['^HSI']
// let intervalList = ['1m']

let db, client;
const main = async () => {
    let {db, client} = await getDb('finance-data')
    db = db
    client = client

    
    let startDay = new Date("2019-04-08")
    let endDay = new Date("2019-04-30")

    for(let a = 0 ; a < intervalList.length; a++){
        let interval = intervalList[a]
        for(let c = 0; c < codeList.length; c ++){
            let stockCode = codeList[c]

            let allData = []   

            for(let start = moment(startDay), end = moment(endDay); start.unix() <= end.unix(); start.add(1, 'days')){

                let startDay = new Date(start.format('YYYY-MM-DD') + " 09:00:00+08:00")
                let endDay = new Date(start.format('YYYY-MM-DD') + " 16:00:00+08:00")
                let data = await getData(stockCode, startDay.getTime()/1000, endDay.getTime()/1000, interval)
                if(typeof(data) === "string"){
                    console.log(`No data found "${moment(startDay).format('YYYY-MM-DD')}" in "${interval}" for stock code "${stockCode}"`)
                }else{
                    allData = allData.concat(data)
                }

            }
            _.sortBy(allData, (r) => {
                return r.ts
            })
            console.log(allData)
            let csv = json2csvParser.parse(allData);
            fs.writeFileSync(`./data/stock_${stockCode}_${interval}.csv`, csv)
        }
    }

    client.close()
}
main().catch((err) => {
    console.log(err)
    if(client){
        client.close()
    }
})