import cryptoRandomString from 'crypto-random-string';

const generateClassId = ()=>{
let generatedString = cryptoRandomString({length:200})
let sliceBottom = Math.floor(Math.random()*100)
let sliceTop =100+ Math.ceil(Math.random()*100)
let classId = generatedString.slice(sliceBottom,sliceTop)
console.log('classId',classId);
}
module.exports = {generateClassId}