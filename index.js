const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const path = require('path');
const fs = require('fs')

// AMAZON S3 DL STUFF - UPLOAD URL TO S3
var AWS = require('aws-sdk');
const accessKeyId = process.env['accessKeyId']
const secretAccessKey = process.env['secretAccessKey']
const s3 = new AWS.S3({
	accessKeyId: accessKeyId,
	secretAccessKey: secretAccessKey,
});

const lostCatSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	breed: String,
	age: String,
	gender: String,
	ogUrl: String,
	imgUrl: String,
	location: String,
	s3imgUrl: String,
	lostLocation: String,
	catColor: String,
}, { timestamps: true, collection: 'lost_cat_final' });

const lostCatImageSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	s3imgUrl: String,
}, { timestamps: true, collection: 'lost_cat_images' })

const lostCatDetailSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	lostLocation: String,
	catColor: String,
}, { timestamps: true, collection: 'lost_cat_details' })

const LostCat = mongoose.model('LostCat', lostCatSchema);
const LostCatImages = mongoose.model('LostCatImages', lostCatImageSchema);
const LostCatDetails = mongoose.model('LostCatDetails', lostCatDetailSchema);

const mongoPass = process.env['mongoPass']

mongoose.connect(
	`mongodb+srv://pdao:${mongoPass}@atlascluster.9zfnrrz.mongodb.net/LostCats`
);

const db = mongoose.connection

const url = 'https://hawaiianhumane.org/lost-pets/?speciesID=2';
const url2 = 'https://hawaiianhumane.org/lost-pets-details/?animalID='

app.use(express.static('static'));

app.get('/', (req, res) => {
	res.sendFile(path.resolve('pages/index.html'))
})

// API - SAVE - will use later
// app.get('/api/collections', async (req, res) => {
// 	const myData = await LostCat.find()
// 	res.json(myData);
// });

// open up the porties
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

// global variables

const idArray = [];

function scrape() {
	axios(url)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);
			$('article', html).each(async function() {
			let id = $(this).data('id');
			let name = $(this).data('name');
			let	age = $(this).data('agetext');
			let	gender = $(this).data('gender');
			let breed = $(this).data('primarybreed');
				// url = $(this).data('detailsurl');
			let tempLocation = $(this).children('.animal-location.card-footer').children('span.small.text-truncate').text()
			let tempImgUrl = $(this).children().data('bg');
			let regex = /(?:pet)/g;
			let subst = `pets`;
			let ogUrl = url.replace(regex, subst);
			let regex2 = /url\('/g
			let regex3 = /'\)/g
			let tempImgUrl2 = tempImgUrl.replace(regex2, '')
			let imgUrl = tempImgUrl2.replace(regex3, '')
			let locationRegex = /Location: /guis;
			let location = tempLocation.replace(locationRegex, '')
				console.log(id, name, age, gender);
			let result = LostCat.findById(id)
			 if (result == null) {
			let newLostCat = await LostCat.create({
				_id: id,
				name: name,
				age: age,
				gender: gender,
				breed: breed,
				ogUrl: ogUrl,
				imgUrl: imgUrl,
				s3imgUrl: s3imgUrl,
				location: location,
				lostLocation: lostLocation,
				catColor: catColor,
			});
			newLostCat.save();
			}
					})
					}).catch((err) => console.log(err));
			}
	scrape();

// }
// let lostCatSearch = LostCat.findById(id).exec()
// let LostCatImageSearch = LostCatImages.findById(id).exec()
// let LostCatDetailsSearch = LostCatDetails.findById(id).exec()
// (async () => {
//   try {
//     await mongoose.connect(
// 	`mongodb+srv://pdao:${mongoPass}@atlascluster.9zfnrrz.mongodb.net/LostCats`,{ useNewUrlParser: true });
//     const docs = await LostCat.find({},{ _id: 1 });
//     console.log(docs);
//     mongoose.disconnect();
//   } catch (err) {
//     console.error(err);
//     mongoose.disconnect();
//   }
// })();
// console.log(id, name, age, gender, breed, tempLocation, tempImgUrl, subst, ogUrl, imageUrl, imgUrl, s3imgUrl, location, catColor, lostLocation, fileName, idArray);

// if (result == id) {
// let doc = await LostCat.findById(id).exec();
// if(result2.s3imgUrl == null) {
// doc.s3imgUrl = 	s3imgUrl;
// }
// if(result2.catColor == null) {
// 	doc.catColor = catColor;
// }	
// if(result2.lostLocation == null) {
// 	result.lostLocation = lostLocation;
// }
// console.log()
// if (result != id) {



// }


async function scrapeDetails() {
	const firstIds = await LostCat.distinct('_id');
	for (const id of firstIds) {
		setTimeout(async function(){
		let secondIds = await LostCatDetails.findById(32444155)
		if (secondIds == null) {
			let urls = url2 + id
			axios(urls)
				.then((response) => {
					const html2 = response.data
					const $ = cheerio.load(html2)
					$('.animal-location-lost', html2).each(async function() {
						let name = $('h1.animal-header.h2.m-y-0').text()
						let lostLocation = $('span.location-lost-value.value.c-1-2').text()
						let catColor = $('span.color-value.value.c-1-2').text()

						let newLostCatDetail = await LostCatDetails.create({
							_id: id,
							name: name,
							lostLocation: lostLocation,
							catColor: catColor,
						})
						newLostCatDetail.save();
					})
				}).catch((err) => console.log(err));
		} else {
			console.log(id, 'exists and skipping')
		}
			}, 4000)
	}
}

//     } else {
// 
// }

scrapeDetails();







// 				async function uploadImageFromUrlToS3(imgUrl, bucketName, fileName) {
// 						try {
// 							const response = await axios.get(imgUrl, {
// 								responseType: 'arraybuffer'
// 							});
// 							const buffer = Buffer.from(response.data, 'binary');

// 							const params = {
// 								Bucket: bucketName,
// 								Key: fileName,
// 								Body: buffer,
// 								ACL: 'public-read',
// 								ContentType: response.headers['content-type']
// 							};


// 							const data = await s3.upload(params).promise();
// 							s3imgUrl = `${data.Location}`
// 							console.log(s3imgUrl)

// 							let newLostCatImage = await LostCatImages.create({
// 								_id: id,
// 								name: name,
// 								s3imgUrl: s3imgUrl,
// 							})
// 								newLostCatImage.save();

// 							console.log(`Successfully uploaded image to S3: ${data.Location}`);
// 						} catch (error) {
// 							console.error(`Failed to upload image to S3: ${error}`);
// 						}
// 							imageUrl = imgUrl;
// 							bucketName = 'phung-stuff';
// 							fileName = `${id}`;
// 						}
// 					uploadImageFromUrlToS3(imgUrl, bucketName, fileName)


// Every 12 hours
// setInterval(scrape, 40000000)

