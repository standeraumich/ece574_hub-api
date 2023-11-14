var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var dotenv = require('dotenv');
dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise()

async function getData() {
  const [rows] = await pool.query("SELECT * FROM sensors")
  return rows
}

async function getSensorLatest() {
  const [row] = await pool.query(`
    SELECT a.*
    FROM \`sensors\` a
	  LEFT JOIN \`sensors\` b
		ON a.sensor = b.sensor AND a.created < b.created
    WHERE b.created is NULL;
    `)
  return row
}

async function insertSensorData(sensor, data) {
  const result = await pool.query(`
    INSERT INTO sensors (sensor, data)
    VALUES (?, ?)
    `, [sensor, data])
  return result
}

/* GET latest sensor data. */
router.get('/latest', async function (req, res, next) {
  const sensorData = await getSensorLatest()
  // res.json({
  //   data: sensorData
  // });
  res.send(sensorData)
});

/* GET all sensor data. */
router.get('/', async function (req, res, next) {
  const sensorData = await getData()
  res.send(sensorData)
});

/* POST sensor data entry */
router.post('/', async function (req, res, next) {
  const { sensor, data } = req.body
  const sensorData = await insertSensorData(sensor, data)
  res.status(201).send(sensorData)
});


module.exports = router;
