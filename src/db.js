const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird')

const connectionStr = "mongodb+srv://jefflee:Jeff9902!@cluster0-ynzvy.mongodb.net/test"

const getDb = async (dbName) => {
    const client = MongoClient(connectionStr, {useNewUrlParser : true})
    await client.connect()
    let db = client.db(dbName)
    return {db, client}
}

module.exports = {
    getDb
}