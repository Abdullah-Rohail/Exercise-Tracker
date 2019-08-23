const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const userSchema = require("./model.js");

const cors = require("cors");

// Basic Configuration
require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/exercise/new-user", (req, res) => {
	// console.log(USER);
	var userData = userSchema.findOne(
		{ username: req.body.username },
		(err, data) => {
			if (err) {
				return err;
			}
			console.log(req.body);
			if (data === null) {
				let _user = new userSchema({ username: req.body.username });
				_user.save((err, data) => {
					if (err) return err;
					res.json({ id: data._id, username: req.body.username });
				});
			} else {
				res.send("Username Already Taken");
			}
		}
	);
});
function isValidDate(date) {
	if (date === "") {
		return false;
	}
	var parsedDate = Date.parse(date);

	if (isNaN(date) && !isNaN(parsedDate)) {
		return true;
	}
	return false;
}
app.post("/api/exercise/add", (req, res) => {
	userSchema.findById({ _id: req.body.userId }, (err, data) => {
		if (err) {
			return err;
		}
		if (data === null) {
			res.send("unknown id");
			res.end();
		} else {
			if (isNaN(Number(req.body.duration))) {
				res.send(
					`Cast to Number failed for value "${
						req.body.duration
					}" at path "duration"`
				);
				res.end();
			} else if (!isValidDate(req.body.date) && req.body.date !== "") {
				res.send(
					`Cast to Date failed for value "${req.body.date}" at path "date"`
				);
				res.end();
			} else {
				console.log("Body date is" + req.body.date);
				console.log(isValidDate(new Date(req.body.date)));
				if (req.body.date === "") {
					var date = new Date();
					// var d = Date.now();
					data.log.date = date.toDateString();
					// console.log("1 " + data.date);
				} else {
					var date = new Date(req.body.date);
					data.log.date = date.toDateString();
					// console.log("2 " + data.date);
				}

				data.count = data.count + 1;
				console.log("Before Push" + data.log.date);
				data.log.push({
					description: req.body.description,
					duration: req.body.duration,
					date: data.log.date
				});

				data.save((err, data) => {
					if (err) return err;
					res.json({
						_id: data._id,
						username: data.username,
						description: req.body.description,
						duration: req.body.duration,
						date: data.log.date
					});
				});
			}
		}
	});
});
app.get("/api/exercise/users", (req, res) => {
	MongoClient.connect(process.env.MONGOLAB_URI, function(err, client) {
		assert.equal(null, err);
		const db = client.db("test");
		const cursor = db
			.collection("userexercises")
			.find({})
			.toArray(function(err, documents) {
				if (err) {
					return err;
				}
				res.json(documents);
				console.log(documents);
			});
		client.close();
	});
});

app.get("/api/exercise/log:user_id", (req, res, done) => {
	// params :user_id required
	// query : from to limit optional
	userSchema.findById({ _id: req.params.user_id }, (err, data) => {
		if (err) {
			return done(err);
		}
		let fromDate = new Date(req.query.from);
		let toDate = new Date(req.query.to);
		let limit = req.query.limit;

		let results = data.log;
		if (!isNaN(toDate) && !isNaN(fromDate)) {
			results = results.filter(function(item) {
				return item.date >= fromDate && item.date <= toDate;
			});

			if (!isNaN(limit)) {
				results = results.slice(0, limit);
			}
			res.json({
				_id: data._id,
				username: data.username,
				count: results.length,
				log: results
			});
		} else {
			res.json({
				_id: data._id,
				username: data.username,
				count: data.count,
				log: data.log
			});
		}
	});
});

// Not found middleware
app.use((req, res, next) => {
	return next({ status: 404, message: "not found" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
