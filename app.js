const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(
  "mongodb://localhost:27017/details",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB connected");
  }
);

//userschema
const userSchema = new mongoose.Schema(
  { name: String, email: String, id: Number },
  {
    timestamps: true,
  }
);
const usermodel = mongoose.model("User", userSchema);

//countertableschema

const counterSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  seq: {
    type: Number,
  },
});
const countermodel = mongoose.model("Counter", counterSchema);

//create user in database with autoIncrement Id
app.post("/search", (req, res) => {
  countermodel.findOneAndUpdate(
    { id: "autoval" },
    { $inc: { seq: 1 } },
    { new: true },
    (err, cd) => {
      let seqId;

      if (cd == null) {
        const newval = new countermodel({ id: "autoval", seq: 1 });
        newval.save();
        seqId = 1;
      } else {
        seqId = cd.seq;
      }
      const data = new usermodel({
        name: req.body.name,
        email: req.body.email,
        id: seqId,
      });
      data.save();
    }
  );
  res.send(data);
});

//search user with one letter
app.get("/search/:key", async (req, res) => {
  let data = await usermodel.find({
    $or: [
      { name: { $regex: req.params.key } },
      { email: { $regex: req.params.key } },
    ],
  });

  console.log(req.params.key);
  res.send(data);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
