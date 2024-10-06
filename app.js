//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://admin-zishan:${process.env.PASSWORD}@cluster0.ylzm0.mongodb.net/todolistDB`);

const itemsSchema = new mongoose.Schema({
  name: { type: String, require: true }
});

const Item = mongoose.model("Item", itemsSchema);

const newItem = new Item({
  name: "Brush your teeth."
});

const item1 = new Item({
  name: "click submit to save."
});

const item2 = new Item({
  name: "Sleep for a while."
});

const defaultItem = [newItem, item1, item2]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  Item.find()
    .then((items) => {
      if (items.length === 0) {

        Item.insertMany(defaultItem)
          .then(() => { console.log("success") })
          .catch((err) => { console.log(err) });

        res.redirect("/");

      } else {
        res.render("list", { listTitle: "today", newListItems: items });
      }

    })
    .catch((err) => {
      console.log(err)
    });



});

app.post("/", function (req, res) {
  const itemName = req.body.newItem
  const listName = req.body.list

  const itemMondol = new Item({
    name: itemName
  });

  if (listName === "today") {
    itemMondol.save();

    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(itemMondol);
      foundList.save();

      res.redirect("/" + listName)
    }).catch((err) => { console.log(err) });
  }

});

app.post("/delete", (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today") {
    Item.deleteOne({ _id: checkItemId }).then((result) => {
      console.log('Deleted document:', result);
    }).catch((error) => {
      console.error('Error deleting document:', error);
    });
    res.redirect("/")
  } else {
    List.updateOne({ name: listName }, { $pull: { items: { _id: checkItemId } } }).then((result) => { console.log("Updated:", result) }).catch((error) => {
      console.error('Error Updating document:', error);
    });

    res.redirect("/" + listName);
  }


})

app.get("/:customListName", (req, res) => {
  const customLIstName = _.capitalize(req.params.customListName);



  List.findOne({ name: customLIstName }).then((fokunni) => {
    if (!fokunni) {
      const list = new List({
        name: customLIstName,
        items: defaultItem
      });

      list.save();

      res.redirect("/" + customLIstName);
    } else {
      res.render("list", { listTitle: fokunni.name, newListItems: fokunni.items });
    }
  }).catch((err) => {
    console.log(err);
  });
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});


