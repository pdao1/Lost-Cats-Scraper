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
const mongoPass = process.env['mongoPass']





const uploadImageFromUrlToS3 = async (imageUrl, bucketName, fileName) => {
	try {
		const response = await axios.get(imageUrl, {
			responseType: 'arraybuffer'
		});
		const buffer = Buffer.from(response.data, 'binary');

		const params = {
			Bucket: bucketName,
			Key: fileName,
			Body: buffer,
			ACL: 'public-read',
			ContentType: response.headers['content-type']
		};

		const data = await s3.upload(params).promise();
		s3imgUrl = `${data.Location}`
		console.log(s3imgUrl)
		console.log(`Successfully uploaded image to S3: ${data.Location}`);
	} catch (error) {
		console.error(`Failed to upload image to S3: ${error}`);
	}
};


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


const url = 'https://hawaiianhumane.org/lost-pets/?speciesID=2';
const url2 = 'https://hawaiianhumane.org/lost-pets-details/?animalID='

app.use(express.static('static'));

app.get('/', (req, res) => {
	res.sendFile(path.resolve('pages/index.html'))
})
app.get('/map', (req, res) => {
	res.sendFile(path.resolve('pages/map.html'))
})

// API - SAVE - will use later
app.get('/api/collections', async (req, res) => {
	const myData = await LostCat.find()
	res.json(myData);
});

// open up the porties
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});


// if (doc == null) { console.log('skipping duplicates') }
// if (doc = null) { 

// const imageUrl = imgUrl;
// const bucketName = 'phung-stuff';
// const fileName = `${id}`;
// uploadImageFromUrlToS3(imageUrl, bucketName, fileName)
const idArray = [];
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
var mUrl = `mongodb+srv://pdao:${mongoPass}@atlascluster.9zfnrrz.mongodb.net/LostCats`

mongoose.connect(mUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Use the database object
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
	console.log('Connected successfully to server');
})
function scrape() {
	axios(url)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);
			$('article', html).each(async function() {
				id = $(this).data('id');
				name = $(this).data('name');
				age = $(this).data('agetext');
				gender = $(this).data('gender');
				breed = $(this).data('primarybreed');
				tempLocation = $(this).children('.animal-location.card-footer').children('span.small.text-truncate').text()
				tempImgUrl = $(this).children().data('bg');
				regex = /(?:pet)/g;
				subst = `pets`;
				ogUrl = url.replace(regex, subst);
				regex2 = /url\('/g
				regex3 = /'\)/g
				tempImgUrl2 = tempImgUrl.replace(regex2, '')
				imgUrl = tempImgUrl2.replace(regex3, '')
				locationRegex = /Location: /guis;
				location = tempLocation.replace(locationRegex, '')
				s3imgUrl = `https://phung-stuff.s3.amazonaws.com/${id}`
				const doc = await LostCat.findById(id)
						doc._id = id,
						doc.name = name,
						doc.age = age,
						doc.gender = gender,
						doc.breed = breed,
						doc.ogUrl = ogUrl,
						doc.imgUrl = imgUrl,
						doc.location = location,
						// doc.catColor = catColor,
						// doc.lostLocation = lostLocation,
						doc.s3imgUrl = s3imgUrl,
						await doc.save();
					// 							})
					// 						}).catch(error => {
					// handle error here

				})
			})
		}

scrape()
// setTimeout(function() {
// urls = url2 + id
// axios(urls)
// .then((response) => {
// const html2 = response.data
// const $$ = cheerio.load(html2)
// $('.animal-location-lost', html2).each(async function() {
// lostLocation = $$('span.location-lost-value.value.c-1-2').text()
// catColor = $$('span.color-value.value.c-1-2').text()
// console.log(id, catColor, lostLocation, urls)
// })
// })
// }, 5000)
// 


// 				
// console.log(id, catColor, lostLocation, urls)
// 					
// console.error(error);


// async function test() {
// 	testQuery = await LostCat.findById(id)
// }
// test()
// 12Hours
// setInterval(scrape, 43200000)

// async function lookUp() {
// 		let detailResults = await LostCatDetails.findById(idArray[i]).exec()
// 		if (detailResults != null) {
// 			console.log('skipping')
// 			continue;
// 		} else {
// 			setTimeout(async = () => {
// 				let urls = url2 + id
// 				console.log(urls)
// 				setTimeout(function() {
// 					axios(urls)
// 						.then((response) => {
// 							const html2 = response.data
// 							const $ = cheerio.load(html2)
// 							$('.animal-location-lost', html2).each(async function() {
// 								let name = $('h1.animal-header.h2.m-y-0').text()
// 								let lostLocation = $('span.location-lost-value.value.c-1-2').text()
// 								let catColor = $('span.color-value.value.c-1-2').text()
// 								filter = { _id: idArray[i] };
// 								update = { name: name, lostLocation: lostLocation, catColor: catColor };
// 								const doc = await LostCatDetails.findOneAndUpdate(filter, update, {
// 									new: true,
// 									upsert: true,
// 									runValidators: true,
// 									setDefaultsOnInsert: true,
// 								});
// 							}, 10000)
// 						}, 10000)
// 				})
// 			})
// 		}
// 	}



// // Finding IDS
async function nullId() {
	let ids = await LostCat.find({}, '_id').exec();
	let nullIds = (ids.s3imgUrl == null)
	console.log(nullIds)
}

function findDocsThatHasNoS3Url() {
	LostCat.find({ s3imgUrl: null }).select('_id imgUrl').exec()
		.then(docs => {
			console.log(docs);
			docs.forEach(async function(doc) {

				// uploads image if necessary
				const imageUrl = doc.imgUrl;
				const bucketName = 'phung-stuff';
				const fileName = `${doc._id}`;

				uploadImageFromUrlToS3(imageUrl, bucketName, fileName)
				// finds the doc by ID then updates the s3imgUrl field				
				let updateDoc = await LostCat.findById(doc._id)
				updateDoc.s3imgUrl = `https://phung-stuff.s3.amazonaws.com/${doc._id}`
				await updateDoc.save()
			})
		})
}

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




//     } else {
// 
// }








				// async function uploadImageFromUrlToS3(imageUrl, bucketName, fileName) {
				// 		try {
				// 			const response = await axios.get(docs.imgUrl, {
				// 				responseType: 'arraybuffer'
				// 			});
				// 			const buffer = Buffer.from(response.data, 'binary');

				// 			const params = {
				// 				Bucket: bucketName,
				// 				Key: fileName,
				// 				Body: buffer,
				// 				ACL: 'public-read',
				// 				ContentType: response.headers['content-type']
				// 			};


				// 			const data = await s3.upload(params).promise();
				// 			let s3imgUrl = `${data.Location}`
				// 			console.log(s3imgUrl)

				// 			// let newLostCatImage = await LostCatImages.create({
				// 			// 	_id: id,
				// 			// 	name: name,
				// 			// 	s3imgUrl: s3imgUrl,
				// 			// })
				// 			// 	newLostCatImage.save();

				// 			filter = { _id: docs._id };
				// 			update = { s3imgUrl: s3imgUrl };
				// 			const doc = await LostCat.findOneAndUpdate(filter, update, {
				// 		  new: true,
				// 		  upsert: true,
				// 			runValidators: true,
				// 			setDefaultsOnInsert: true,

				// 			console.log(`Successfully uploaded image to S3: ${data.Location}`);
				// 		} catch (error) {
				// 			console.error(`Failed to upload image to S3: ${error}`);
				// 		}
				// 			imageUrl = imgUrl;
				// 			bucketName = 'phung-stuff';
				// 			fileName = `${docs._id}`;
				// 		}
				// 	uploadImageFromUrlToS3(imageUrl, bucketName, fileName)


// Every 12 hours
// scrape()
// setInterval(scrape, 40000000)
