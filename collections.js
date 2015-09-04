//fundred collection'in icinde: 1.isim 2.fundred ismi 3.location(array alcaksin) 4.imaj id 5.like
//imaj collection'in icinde: imaj dosyasi
// comment collection: 1.fundred id 2.mesaj

Fundreds = new Mongo.Collection ("fundreds");
Comments = new Mongo.Collection ("comments");
Markers = new Mongo.Collection('markers');  

Stores = {};

Stores.images = new FS.Store.GridFS("images");
Stores.thumbs = new FS.Store.GridFS("thumbs");
Stores.any = new FS.Store.GridFS("any");

FundredImages = new FS.Collection('fundredimages', {
   stores: [
   Stores.images,
   Stores.thumbs
 ]
});
FundredImages.allow({
 insert: function () {
   return true;
 },
 update: function () {
   return true;
 },
 remove: function () {
   return true;
 },
 download: function () {
   return true;
 }
});

TempImage=new FS.Collection('tempImage', {
   stores: [
   Stores.images,
   Stores.thumbs
 ]
});

TempImage.allow({
   insert: function () {
   return true;
 },
 update: function () {
   return true;
 },
 remove: function () {
   return true;
 },
 download: function () {
   return true;
 }
});
