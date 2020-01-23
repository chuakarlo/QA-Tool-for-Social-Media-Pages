var app = angular.module('notes', ['ngTouch','ngCookies','angular.filter']);
app.controller('ctrl1', function($scope, $location,request,$window,fetch,$q, $sce){

//variables

$scope.user = {};
$scope.note = {};

get_in();

//redirect to login page if credentials not found && get log in details && get notes
function get_in(){
    var query = {
        url : '/check_'
    }
    request.query(query).then(function(res){
        var data = res.data;
        $scope.user = data.logged;        
        if(data.logged && data.logged.exten == "admin"){
            refresh()
        }
        else if(data.logged.exten !== "admin")
        {
            $window.location.href = '/login.html';
        }
        else
        {
            $window.location.href = '/login.html';
        }
    })
}

//renew list
function refresh(){
    var get_note = {
        url : '/get_users',
    }
    request.query(get_note).then(function(res){
        var data = res.data;
        $scope.names = data;
    })    
}

$scope.get_agent_notes = function(){
    var data = $scope.selected;
    var query = {
        url : '/get_notes_admin',
        user : data.id
    }
    request.query(query).then(function(res){
        var data = res.data;        
        $scope.private = [];
        $scope.public = [];
        for(i = 0; i < data.length; i ++){
            if(data[i].type == "private"){
                $scope.private.push(data[i]);
            }
            else if (data[i].type == "public")
            {
                $scope.public.push(data[i]);
            }
        }
    })
}

function get_agent_note(x){
    var data = $scope.selected;
    var query = {
        url : '/get_notes_admin',
        user : x.id
    }
    request.query(query).then(function(res){
        var data = res.data;        
        $scope.private = [];
        $scope.public = [];
        for(i = 0; i < data.length; i ++){
            if(data[i].type == "private"){
                $scope.private.push(data[i]);
            }
            else if (data[i].type == "public")
            {
                $scope.public.push(data[i]);
            }
        }
    })
}

$scope.sign_out = function(){
    var query = {
        url : '/log_out'
    }
    request.query(query).then(function(res){
        var data = res.data;
        if(data == "Ok"){
            $window.location.href = '/login.html';
        }
        else
        {
            console.log(res.data);            
        }
    })    
}

//show notes
$scope.show_note = function(x){
    $scope.note = x;
    $('#trumbowyg').trumbowyg('html',x.content); 
}

//delete notes
$scope.delete_note = function(){
    var query = {
        url : '/delete_note',
        data : $scope.note
    }
    request.query(query).then(function(res){
        if(res.data == "Ok"){
           get_agent_note($scope.selected)
        }
        else
        {
            console.log(res.data);
        }
    })
}



//render html
$scope.render_ = function(e) {
    return e.replace(/(<([^>]+)>)/ig," ");
}

});


app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});   
