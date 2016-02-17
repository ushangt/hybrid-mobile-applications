/*
 * Defining variables
 */
var USER_ID				= "user_id";
var USER_NAME 			= "user_name";
var FULL_NAME 			= "full_name";
var EMAIL_ID 			= "email_id";
var COUNTRY				= "country";
var REGION_ID 			= "region_id";
var POCKET_ID			= "pocket_id";
var FISH_ID				= "fish_id";
var FISH_PER			= "fish_percentage";
var FISH_PROBABILITY	= "fish_probability";
var LATITUDE			= "latitude";
var LONGITUDE			= "longitude";
var ALTITUDE			= "altitude";
var BASE_URL			= "http://neebaltech.neebal.com:1111/fishtrap/fishtrapservice/";
var IMAGE_URL			= "http://neebaltech.neebal.com:1111/fishtrap/uploads/";

//Initializing database object
var db = window.openDatabase("fish_trap", "1.0", "Fish Trap", 200000);
/*
 * Initializing Fast Click
 */
window.addEventListener('load', function() {
	new FastClick(document.body);
}, false);

/*
 * Initialising the app
 */
var app = {
    initialize: function() {
        this.bindEvents();
        
        if(window.localStorage.getItem(USER_NAME)) {  
    		location.href = "#regionScreen";
    	}
    	else {
    		location.href = "#loginScreen";
    	}
    },
   
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
   
    onDeviceReady: function() {   

    	if(window.localStorage.getItem(USER_NAME)) {  
    		$(".hi_user").html("Hi, "+window.localStorage.getItem(USER_NAME));
    	}
    	
    	document.addEventListener("backbutton", onBackKeyDown, false);
    	$(".search_icon").on("touchstart",function(){    		
    		var page = $(this).attr("page");		
    		if(page == "search"){
    			window.history.back();						
    		}
    		else{			
    			navigateTo( "searchScreen" , "slidedown");			
    		}		
    	});	
    	    	
    	$(".refresh_btn").click(function(e){
    		fishandWeatherDetails();
    	});    	
    },
    
    	receivedEvent: function(id) {    	
    }
};

//Disable the Back Button
function onBackKeyDown(e) {
	  e.preventDefault();
	}

//Start Geo Location Service
function startGeoLocation() {
	navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
}
  
//Store `Position` properties from the geolocation on local storage
function onLocationSuccess(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	window.localStorage.setItem(LATITUDE,lat);
	window.localStorage.setItem(LONGITUDE,lon);
	window.localStorage.setItem(ALTITUDE,position.coords.altitude);		
}

// Show an alert if there is a problem getting the geolocation and redirect user to start GPS Settings page	
function onLocationError() {		
	/*
	WebIntent.prototype.foo({
					action: 'android.settings.LOCATION_SOURCE_SETTINGS'
				},function(){},function(e){}	
		);	
		*/
	alertMsg('Location Service disabled');
}

/*
 * Used For navigation from a page to another.
 */ 
function navigateTo(screenId, transitionEffect){
    $.mobile.changePage( "#" + screenId, { transition: transitionEffect });
}

/**
 * Start JQuery Functions
 */
$( document ).on( "pageshow", "#homeScreen", function( event ) {
	fishandWeatherDetails();
});

$( document ).on( "pageinit", "#regScreen", function( event ) {	
	/*
	 * Saving User Information when clicked save
	 */
	$( "#regScreen_save" ).click(function(e){			
		var username = $( "#username" ).val();
		var fullname = $( "#full_name" ).val();
		var email_id = $( "#email_id" ).val();
		var password = $( "#password").val();
		var confirm_password = $( "#confirm_password").val();
		var country  = $( "#country").val();		
		if(mandatory_check(fullname) == false){
			alertMsg("Please enter your full name");
			return false;
		}		
		if(email_check(email_id) == false){				
			alertMsg("Please enter correct email");
			return false;
		}
		if(mandatory_check(username) == false){				
			alertMsg("Please enter your username");
			return false;
		}		
		if(mandatory_check(password) == false){
			alertMsg("Please enter your password");
			return false;
		}
		if(password != confirm_password){
			alertMsg("Passwords should match");
			return false;
		}
		if(mandatory_check(country) == false){
			alertMsg("Please enter your country");
			return false;
		}
		if(!$("#accept_box").is(':checked')){
			alertMsg("Please accept the Terms & Conditions");
			return false;
		}
		window.localStorage.setItem(USER_NAME,	username);
		window.localStorage.setItem(FULL_NAME,	fullname);
		window.localStorage.setItem(EMAIL_ID,	email_id);
		window.localStorage.setItem(COUNTRY,	country);
		e.preventDefault();
		$.ajax({
			type : "POST",		
			data : "userFullName="+fullname+"&userEmail="+email_id+"&password="+password+"&username="+username+"&countryId="+country,
	        url  :  BASE_URL+"postRegistration"
		}).done( function(msg) {
			var response = JSON.stringify(msg);
			var parsedResponse = JSON.parse(response);
			if(msg){
				if(parsedResponse.message){
					alert(parsedResponse.message);
					return false;
				}				
				navigateTo("regionScreen" , "fade");
			}
			else {
				alert("Server not responding. Please try again later.");
			}
		});				
	});
	
});

$( document ).on( "pageinit", "#loginScreen", function( event ) {
	
		$("#login_btn").click(function(e){					
			var login_username = $("#login_username").val();
			var login_password = $("#login_password").val();	
			if(mandatory_check(login_username) == false){				
				alertMsg("Please enter your username");
				return false;
			}
			if(mandatory_check(login_password) == false){
				alertMsg("Please enter your password");
				return false;
			}
			e.preventDefault();
			$.ajax({
				type : "POST",		
				data : "username="+login_username+"&password="+login_password,
		        url  : BASE_URL+"userLogin"
			}).done( function(msg) {
				var response = JSON.stringify(msg);
				var parsedResponse = JSON.parse(response);
				if(msg){										
					if(parsedResponse.message == "success"){
						window.localStorage.setItem(USER_NAME,	login_username);
						window.localStorage.setItem(USER_ID,	parsedResponse.id);
						navigateTo( "regionScreen" , "fade");
					} else {						
						window.plugins.toast.showShortCenter( parsedResponse.message );																
					}				
				}				
			});		
		});
});

$( document ).on( "pageinit", "#forgotPassword", function( event ) {
	$("#forgotPwd_btn").on('click',function(){
		$.ajax({
			type : "POST",		
			data : "username="+$("#forgot_userId").val()+"&emailID="+$("#forgot_userEmail").val() ,
	        url  : BASE_URL+"forgotPassword"
		}).done( function(msg) {
			if(msg){
				window.plugins.toast.showLongBottom( msg["message"] );
			}
		});
	})
});

$(document).on('pageshow','#regionScreen',function(){
	var region_id = 1;	
	var map = new GoogleMap();
    map.initialize("map_canvas",region_id);
});

$(document).on('pageshow','#fishDetails',function(){
	var map = new GoogleMap();
    map.initialize("fish_map");
    getFishDetails(window.localStorage.getItem(FISH_ID));
});

$(document).on('pageshow','#settingsScreen',function(e){
	getUserDetails(window.localStorage.getItem(USER_ID));
    $("#setting_save").on('click',function(){
		var fullname = $( "#settingsScreen #full_name" ).val();
		var email_id = $( "#settingsScreen #email_id" ).val();
		var password = $( "#settingsScreen #password").val();
		var confirm_password = $( "#settingsScreen #confirm_password").val();		
		if(mandatory_check(fullname) == false){
			alertMsg("Please enter your full name");
			return false;
		}		
		if(email_check(email_id) == false){				
			alertMsg("Please enter correct email");
			return false;
		}			
		if(mandatory_check(password) == false){
			alertMsg("Please enter your password");
			return false;
		}
		if(password != confirm_password){
			alertMsg("Passwords should match");
			return false;
		}	
		//alert("id="+window.localStorage.getItem(USER_ID)+"name="+fullname+"&email="+email_id+"&password="+password);
		$.ajax({
			type : "POST",		
			data : "id="+window.localStorage.getItem(USER_ID)+"&name="+fullname+"&email="+email_id+"&password="+password,
	        url  :  BASE_URL+"updateUserDetails"
		}).done( function(msg) {
			var response = JSON.stringify(msg);
			var parsedResponse = JSON.parse(response);
			if(msg){
				if(parsedResponse.message == "success"){
					window.localStorage.setItem(FULL_NAME,	fullname);
					window.localStorage.setItem(EMAIL_ID,	email_id);
					window.plugins.toast.showShortCenter('Details successfully updated');					
				}								
				else{
					alertMsg("Server not responding. Please try again later.");
				}
			}
			else {
				alertMsg("Server not responding. Please try again later.");
			}
		});				
    });
});

//Function to check if email is valid
function email_check(email){
    var re = /\S+@\S+\.\S+/;  
    if(email === '' || email === ' '|| !re.test(email)){
    	return false;
    }
}
//Function to check mandatory field
function mandatory_check(fieldVal){
    if(fieldVal === '' || fieldVal === ' '){
    	return false;
    }     
}

//Function to show proper pop-ups
function alertMsg(message){
	navigator.notification.alert(
			message, 
			alertDismissed, 
			"FishTrap", 
			"OK");
	navigator.notification.vibrate(1000);
}

function alertDismissed(){
	//nothing to do. Dependent function
}

$(document).bind("mobileinit", function(){
	$.mobile.allowCrossDomainPages = true;
});

function GoogleMap(){
	 
	this.initialize = function(div,region_id){
		var map = showMap(div);
		if(div == "fish_map")
			addCurrentLocationMarker(map,region_id);
		else
			addMarkersToMap(map,region_id);
	}
 
	var showMap = function(div){
		var mapOptions = {
							zoom: 9,
							center: new google.maps.LatLng(19.113, 72.98),
							mapTypeId: google.maps.MapTypeId.ROADMAP
						 }
 
		var map = new google.maps.Map(document.getElementById(div), mapOptions);
 
		return map;
	}
	
	var addMarkersToMap = function(map,region_id){
				
		/** MARKERS AND INFOWINDOWS**/
		var marker = new Array();
		//var infowindow = new Array();
		$.ajax({
	        type : "GET", 
	        data : "id="+region_id,
	        url  : BASE_URL + "getAllFishingPocketsByRegionId",
	    }).done( function(result){
			 if(result) {
				 for(var i=0;i<result.length;i++) {
						var latitudeAndLongitude = new google.maps.LatLng(result[i]['latitude'],result[i]['longitude']);
						var image="images/pocket.png";
						marker[i] = new google.maps.Marker({
							position: latitudeAndLongitude,
							title: result[i]['pocket_name'],
							animation: google.maps.Animation.DROP,
							icon: image,
							map: map
						});
						
						var message = "<a href='' onclick='goToHomeScreen("+result[i]['id']+")' class='location_info'>"+result[i]['pocket_name']+"</a>";
						attachInfoWindow(marker[i], message);											
					}
			 } else {
				 alertMsg("Could not connect to server. Please try again later.");
			 }				
		});
	}
	
	var addCurrentLocationMarker = function (map,region_id){		
		var latitudeAndLongitude = new google.maps.LatLng(window.localStorage.getItem(LATITUDE), window.localStorage.getItem(LONGITUDE));
		var marker = new google.maps.Marker({
			position: latitudeAndLongitude,
			title: "Your Current Location",
			animation: google.maps.Animation.DROP,
			icon: {
			      		path: google.maps.SymbolPath.CIRCLE,
			      		scale: 10
			    	},
			map: map
		});
		var message = "<b>Your Current Location</b>";
		attachInfoWindow(marker, message);
	}
}

function attachInfoWindow(marker, message){
				
	var infowindow = new google.maps.InfoWindow({
	    content: message
	  });

   google.maps.event.addListener(marker, 'click', function() {
     infowindow.open(marker.get('map'), marker);
   });   
}

function goToHomeScreen(pocket_id){
	window.localStorage.setItem(POCKET_ID,pocket_id);
	navigateTo('homeScreen', 'slide');
}

function checkIfRefreshComplete() {
	if( $(".wetherInfo").val() == "0" && $(".fishProb").val() == "0" && $(".refresh_btn .ui-link").hasClass("fa-spin") )
		$(".refresh_btn .ui-link").removeClass("fa-spin");
}

function goToFishDetails(id,percentage,probability){
	window.localStorage.setItem(FISH_ID,id);
	window.localStorage.setItem(FISH_PER,percentage);
	window.localStorage.setItem(FISH_PROBABILITY,probability);
	navigateTo('fishDetails', 'slideup');	
}

function getFishDetails(fish_id){
	// 0-40 low 40-75 medium 75+ high
	 var BACKGROUND="";
	 var PROBABILITY_TEXT="";
	 if(window.localStorage.getItem(FISH_PROBABILITY)> 75){		 
		 BACKGROUND = "green";
		 PROBABILITY_TEXT = "High Probability";
	 }
	 if(window.localStorage.getItem(FISH_PROBABILITY)> 40 && window.localStorage.getItem(FISH_PROBABILITY)< 75){
		 BACKGROUND = "orange";
		 PROBABILITY_TEXT = "Medium Probability";
	 }
	 if(window.localStorage.getItem(FISH_PROBABILITY)>0 && window.localStorage.getItem(FISH_PROBABILITY)< 40){
		 BACKGROUND = "red";
		 PROBABILITY_TEXT = "Low Probability";
	 }
	
	$.ajax({
        type : "GET", 
        data : "id="+fish_id,
        url  : BASE_URL + "getFishDetailById"
    }).done(function(result){    	
		 if(result){			
			 var response = JSON.stringify(result);
			 var parsedResponse = JSON.parse(response);				
			 $("#fishDetails .fish_image_big").html('<img src='+IMAGE_URL+parsedResponse[0]["image"]+' width="100px" height="100px">');
			 $("#fishDetails .fish_name").html(parsedResponse[0]["fish_name"]);
			 /*alert(BACKGROUND);
			 alert(FISH_PER);
			 alert(window.localStorage.getItem(FISH_PROBABILITY));*/
			 $("#fishDetails .probability_counter_high").css("background",BACKGROUND);
			 $("#fishDetails .probability_counter_high").css("width",FISH_PER);
			 $("#fishDetails .fish_probability_text").html(PROBABILITY_TEXT);
			 $("#fishDetails .fish_attributes .size").html(parsedResponse[0]["size"]);
			 $("#fishDetails .fish_attributes .mass").html(parsedResponse[0]["mass"]);
			 $("#fishDetails .fish_attributes .length").html(parsedResponse[0]["length"]);
			 $("#catchingInstructions .specific_instructions").html(parsedResponse[0]["catching_instructions"]);
			 $("#catchingInstructions .baits").html(parsedResponse[0]["baits"]);
			 $("#catchingInstructions .ropes_nets").html(parsedResponse[0]["ropes_and_nets"]);			 
		 }
		 else{
			 alertMsg("Could not connect to server. Please try again later.");
		 }				
	});
}

function fishandWeatherDetails() {
	
	$(".refresh_btn .ui-link").addClass("fa-spin"); // Adding animation to refresh button.
	startGeoLocation();	
	var latitude = window.localStorage.getItem(LATITUDE);
	var longitude = window.localStorage.getItem(LONGITUDE);
	var pocketId = window.localStorage.getItem(POCKET_ID);
	
	$.ajax({
        type 	: "GET", 
        data 	: "pocketId="+ pocketId,
        url  	: BASE_URL + "getFishingProbalityByPocketId",
        success : function(msg){
			        	 var response = JSON.stringify(msg);
				   		 var parsedResponse = JSON.parse(response);
				   		 var innerContent = "<div class='fish'>"+
				   		 						"<div class='fish_widget'>";
				   		 var d = new Date();
				   		 var monthNames = [ "January", "February", "March", "April", "May", "June",
				   		                    "July", "August", "September", "October", "November", "December" ];
				   		 
				   		 $(".date").html(monthNames[d.getMonth()]+" "+d.getDate());
				   		 $(".weather_widget .block2").html( "<img src='images/prob_" + parsedResponse["total_probability"] + ".png' >" );
				   		 var j = 0;
				   		 for ( var i = 0, j = 0; i < parsedResponse["fish_info"].length; i++, j++ ) 
				   		 {	 
				   			 if( j == 0 ) 
				   			 {
				   				 //Wrapping 3 fish div inside a parent div,
				   				 innerContent += "<div class='fish_widget_row'>";
				   			 }
				   			 
				   			 innerContent += 	"<div class='individual_fish' onclick='goToFishDetails("+ parsedResponse['fish_info'][i]['id'] +","+ parsedResponse['fish_info'][i]['probability_per']+","+ parsedResponse['fish_info'][i]['probability_per']+")'>" +
				   							 		"<span class='fish_image'>" +
				   							 			"<img src='"+ IMAGE_URL + parsedResponse["fish_info"][i]["image"] + "' class='fish_thumb'>" +
				   							 		"</span>" +
				   							 		"<span class='color_band_"+parsedResponse["fish_info"][i]["fish_probability"]+"'></span>" +
				   							 		"<span class='fish_name'>" + parsedResponse["fish_info"][i]["fish_name"] + "</span>" +
				   						 		"</div>";
				   			 if( j == 2) 
				   			 {
				   				 //Wrapping 3 fish div inside a parent div,
				   				 innerContent += "</div> ";
				   				 j = -1;
				   			 }
				   		 }
				   		 
				   		 if( j != 0 ){
				   			innerContent += "</div>";
				   		 }
				   			
				   		 innerContent += "</div> </div>";
				   					
				   		console.log(innerContent);
				   		
				   		 $(".main_fish").html( innerContent );
				   		 
				   		 $.ajax({
					        type 	: "GET", 
					        data 	: "lat="+latitude+"&long="+longitude,
					        url  	: BASE_URL + "getWeatherInfo",
					        success : function (result){
										 if(result){
											 var response = JSON.stringify(result);
											 var parsedResponse = JSON.parse(response);
											 $(".weather_icon").html('<img src="images/Weather/'+parsedResponse.weather[0].id+'.png" width="100px" />')
											 $(".temperature").html(Math.round(parsedResponse.main.temp)+'<sup style="font-size:medium;">o</sup><span style="font-family: arial">C</span>')
											 $(".pressure").html(Math.round(parsedResponse.main.pressure));
											 $(".wind").html(Math.round(parsedResponse.wind.speed));
											 $(".humidity").html(Math.round(parsedResponse.main.humidity));
										 } else {
											 alertMsg("Could not connect to weather station. Please try again later.");
										 }	
										 $(".refresh_btn .ui-link").removeClass("fa-spin");
					   		 },
							 error	: function(msg){
								 alertMsg("Could not connect to weather station. Please try again later.");
							 },
							 timeout	: function(msg){
								 alertMsg("Could not connect to weather station. Please try again later.");
							 }
				   		 });
        },
        error	: function(msg){
        	alertMsg("Could not connect to weather station. Please try again later.");
        },
        timeout	: function(msg){
        	alertMsg("Could not connect to weather station. Please try again later.");
        },
    });
}

function getUserDetails(user_id){	
	$.ajax({
        type : "GET", 
        data : "id="+user_id,
        url  : BASE_URL + "getUserDetailById",
    }).done(function(result){    	
		 if(result){			 			 
				$("#settingsScreen #full_name").val(result.name);
				$("#settingsScreen #email_id").val(result.email);			 
		 }
		 else{
			 alertMsg("Could not connect to server. Please try again later.");
		 }				
	});
}

function logout(){		
	window.localStorage.removeItem(USER_NAME)
	navigateTo( "loginScreen" , "fade");	
}
