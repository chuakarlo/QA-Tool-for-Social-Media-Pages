var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter']);
app.controller('ctrl', function($scope, $location,request,$window,fetch,$q, $sce){

$scope.url_;

$scope.$on('$routeChangeStart', function(event,next,current) { 
    var data = next.$$route.originalPath;
    $scope.url_ = data;
    console.log($scope.url_);
})

//Get Reviews Functions

//Easy Life Helper
$scope.get_tp_easy = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_easy',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_easy = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_easy',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_easy = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_easy',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//My Success.Team
$scope.get_tp_mysuccess = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_mysuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_mysuccess = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_mysuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
        console.dir(res.data);
    })
}

$scope.get_gr_mysuccess = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_mysuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Coaching Business
$scope.get_tp_coaching = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_coaching',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_coaching = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_coaching',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_coaching = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_coaching',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Visionary Site
$scope.get_tp_visionary = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_visionary',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_visionary = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_visionary',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_visionary = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_visionary',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Online success
$scope.get_tp_onlinesuccess = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_onlinesuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_onlinesuccess = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_onlinesuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_onlinesuccess = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_onlinesuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Support Service Pro
$scope.get_tp_supportservice = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_supportservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_supportservice = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_supportservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_supportservice = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_supportservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Drive for Success
$scope.get_tp_driveforsuccess = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_driveforsuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_driveforsuccess = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_driveforsuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_driveforsuccess = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_driveforsuccess',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Top Coach Consulting
$scope.get_tp_topcoach = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_topcoach',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_topcoach = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_topcoach',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_topcoach = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_topcoach',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

//Up Service
$scope.get_tp_upservice = function(){
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp_upservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Trust Pilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb_upservice = function(){
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb_upservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr_upservice = function(){
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr_upservice',
    }
    request.query(query).then(function(res){
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}


});