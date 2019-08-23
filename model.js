const mongoose = require("mongoose");
const shortid = require("shortid");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	_id: {
		type: String,
		default: shortid.generate
	},
	username: {
		type: String,
		required: true
	},
	count: { type: Number, default: 0 },
	log: [
		{
			_id: false,
			description: { type: String },
			duration: { type: Number },
			date: { type: Date }
		}
	]
});
const userSchema = mongoose.model("UserExercises", UserSchema);
module.exports = userSchema;

// https://fuschia-custard.glitch.me/api/exercise/log?userId=Sk684Hn4S
// https://fuschia-custard.glitch.me/api/exercise/log?userId=Sk684Hn4S&from=1998-8-12&to=1999-8-12&limit=5

// http://localhost:3000/api/exercise/logLXTblaNXs?from=1993-8-12&to=1999-8-12&limit=1
