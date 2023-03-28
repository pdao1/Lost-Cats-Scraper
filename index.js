const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const app = express();
const port = 8000;
const path = require('path');

const lostSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  breed: String,
  age: String,
  gender: String,
  ogUrl: String,
  imgUrl: String,
});

const LostCat = mongoose.model('LostCat', lostSchema);

mongoose.connect(
  'mongodb+srv://pdao:Watacress1!@atlascluster.9zfnrrz.mongodb.net/'
);

let Lost = new LostCat({
  _id: 123,
  name: 'name',
  age: 'age',
  gender: 'gender',
  breed: 'breed',
  ogUrl: 'ogUrl',
  imgUrl: 'imgUrl',
});
Lost.save();

const url = 'https://hawaiianhumane.org/lost-pets/?speciesID=2';
const url2 = '';
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('pages/index.html'));
});

app.post('/addname', (req, res) => {
  res.send('item saved to database');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// axios(url)
//   .then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const animalID = [];
//     const animalURL = [];
//     $('article', html).each(function () {
//       const id = $(this).data('id');
//       const name = $(this).data('name');
//       const age = $(this).data('agetext');
//       const gender = $(this).data('gender');
//       const breed = $(this).data('primarybreed');
//       const url = $(this).data('detailsurl');
//       const imgUrl = $('article div').data('bg');
//       const regex = /(?:pet)/g;
//       const subst = `pets`;
//       const ogUrl = url.replace(regex, subst);
//       animalID.push({
//         _id: id,
//         name: name,
//         age: age,
//         gender: gender,
//         breed: breed,
//         ogUrl: ogUrl,
//         imgUrl: imgUrl,
//       });
//       let Lost = new LostCat({
//         _id: id,
//         name: name,
//         age: age,
//         gender: gender,
//         breed: breed,
//         ogUrl: ogUrl,
//         imgUrl: imgUrl,
//       });
//       Lost.save();
//     });
//     let formatted = JSON.stringify(animalID);
//     console.log(formatted);
//   })
//   .catch((err) => console.log(err));

// axios(url2).then((response) => {});
