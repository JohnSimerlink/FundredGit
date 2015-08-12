
Router.route('/', function () {
  this.render('Home')
});

Router.route('/map', function(){
  this.render('Map')
} )

Router.route('/gallery', function(){
  this.render('Gallery')
} )

Router.route('/submit', function(){
  this.render('Drawing')
} )

Router.route('/submitdrawing', function(){
  this.render('Submission')
} )


Router.route('/gallery/:_fundredId', function(){
  item=Fundreds.findOne({_id: this.params._fundredId});
  this.render('GalleryOpen',{data:item})
} )

if (Meteor.isClient) {
 Session.setDefault('selectedImageId',null);


//GOOGLE MAPS JAVASCRIPT
 Meteor.startup(function() {
   GoogleMaps.load();
 });

 Template.map.helpers({
   mapOptions: function() {
     if (GoogleMaps.loaded()) {
       return {
         center: new google.maps.LatLng(-37.8136, 144.9631),
         zoom: 8
       };
     }
   }
 });
//END OF GOOGLE MAPS JAVASCRIPS


 Template.Map.rendered = function() {

        // create a map in the "map" div, set the view to a given place and zoom-divi yaz
      var map = L.map('map').setView([42.37, -71.127], 10);
      //L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images';

      // add an OpenStreetMap tile layer


       L.tileLayer.provider('Stamen.Toner').addTo(map);

      // add a marker in the given location, attach some popup content to it and open the popup

    var moneyicon = L.icon({
    iconUrl: 'moneyicon.png',

    iconSize:     [50, 60], // size of the icon
    iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
    });



      var markers=Fundreds.find();

      markers.forEach(function(element,index,array){
        var image = FundredImages.findOne(element.imageId);
        var popup = L.popup({className:'popup'})
                          .setContent('<h3 class="popuptext">'+element.name+ '</h3> <img src="'+image.url()+'" style="width:100px"/>');

        L.marker(element.location, {icon: moneyicon}).addTo(map)
        .bindPopup(popup);



      });

 };


Template.Drawing.rendered = function(){
  var canvas = $('canvas'),
       ctx = canvas[0].getContext('2d'),
       drawing = false,
       from, clr;
   var   parentOffset = canvas.offset();



  canvas.attr({}).hammer().on('dragstart', function(event){
    drawing = true;
    console.log(event.gesture.center.pageX - parentOffset.left);
    from = {x:parseInt(event.gesture.center.pageX - parentOffset.left), y:parseInt(event.gesture.center.pageY- parentOffset.top)};
  }).on('dragend', function(event){
    drawing = false;
  }).on('drag', function(event){
    if (!drawing)
      return;
    console.log(event.gesture.center.pageX - parentOffset.left);
    var to =  {x:parseInt(event.gesture.center.pageX - parentOffset.left), y:parseInt(event.gesture.center.pageY- parentOffset.top)};

    drawLine(ctx,from,to);
    from = to;

  });

   function drawLine(ctx,from,to){
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.closePath();
    ctx.stroke();
   };

   $("#color").spectrum({
    color: "#f00",
    change: function(color) {
    clr=color.toHexString(); // #ff0000
    ctx.strokeStyle = clr;
    }
});
   ctx.strokeStyle = "#f00";
   ctx.scale(300/canvas.width(),300/canvas.height());
   make_base();

   document.ontouchmove=function(event){
    event.preventDefault();
   };

   function make_base()
{
  base_image = new Image();
  base_image.src = 'fundredtemplate.png';
  base_image.onload = function(){

    ctx.drawImage(base_image, 0, 0,canvas.width(),canvas.width()*base_image.height/base_image.width);
  };
}

};

Template.Drawing.events({

  'click #submit-drawing':function(){
    var can=$('canvas');
    console.log(can);
    var img=can[0].toDataURL("image/png");
    FundredImages.insert(img, function(err, fileObj){
               if(err){
                 alert("Error");
               } else {
                 // gets the ID of the image that was uploaded
                 var imageId = fileObj._id;
                 Session.set('selectedImageId',imageId);
                 Router.go("/submitdrawing");
               };
           });
  }
})


 Template.Submission.rendered = function(){
    Dropzone.autoDiscover = false;
   // Adds file uploading and adds the imageID of the file uploaded
   // to the arrayOfImageIds object.
   var arrayOfImageIds = [];

   // mydropzone = new Dropzone("#mydropzone", {
   //    thumbnailWidth: 180,
   //    thumbnailHeight: 180,
   //    dictDefaultMessage: "Drag and Drop Fundreds    or click",
   //    acceptedFiles: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF,.pdf,.pub",
   //    accept: function(file, done){
   //       FundredImages.insert(file, function(err, fileObj){
   //             if(err){
   //               alert("Error");
   //             } else {
   //               // gets the ID of the image that was uploaded
   //               var imageId = fileObj._id;
   //               Session.set('selectedImageId',imageId);
   //               // do something with this image ID, like save it somewhere
   //               arrayOfImageIds.push(imageId);

   //             };
   //         });
   //             // Create the remove button
   //             var removeButton = Dropzone.createElement("<button>Remove file</button>");
   //             var _this = this;
   //             removeButton.addEventListener("click", function(e) {
   //               // Make sure the button click doesn't submit the form:
   //              e.preventDefault();
   //              e.stopPropagation();
   //               // Remove the file preview. And delete it from TempImage.
   //              _this.removeFile(file);
   //              console.log(_this);
   //              //TempImage.remove({"_id":Session.get('selectedImageId')});

   //               });
   //             // Add the button to the file preview element.
   //             file.previewElement.appendChild(removeButton);


   //     }

   // });

};
 Template.Submission.helpers({

      lat: function(){
        if (Geolocation.latLng() !=null)
        return Geolocation.latLng().lat;
        else
        return "waiting for latitude"
      },
      lng: function(){
        if (Geolocation.latLng() !=null)
        return Geolocation.latLng().lng;
        else
        return "waiting for longitude"
      },
      image: function(){
    return FundredImages.findOne(Session.get("selectedImageId"));
  }
 });

 Template.Submission.events ({
"click #submit-button": function(){
  var name = $("#Name").val();
  var fundredname = $("#FundredName").val();
  var lat = $("#Lat").val();
  var lng = $("#Lng").val();
  var imgId = Session.get("selectedImageId");

  Fundreds.insert({name:name,fundredname:fundredname,location:[lat,lng],imageId:imgId,uploadedAt: new Date(),like:0});
  Router.go("/gallery");
}

});

 Template.GalleryItem.events ({
  "click #likebutton": function(){
    var fundredtolike=Template.currentData();
    Fundreds.update(fundredtolike._id, {$inc: {like: 1}});

  }

 });

Template.Gallery.helpers({
  fundreds: function(){
    return Fundreds.find();
  }
});

Template.GalleryItem.helpers({
  image: function(){
    return FundredImages.findOne(this.imageId);
  }
});

Template.GalleryOpen.helpers({
  image: function(){
    return FundredImages.findOne(this.imageId);
  }
});


}



if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
