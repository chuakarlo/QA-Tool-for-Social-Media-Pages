var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter', 'ui.bootstrap']);
app.controller('ctrl', function($scope, $location,request,$window,fetch,$q, $sce,$http){

var dataSource = $http.get('sites.json');

if (dataSource) {
    dataSource.success(function(data) {
        $scope.menus = data;
    });
    dataSource.error(function(data) {
        alert("AJAX failed to load data.");
    });
}

$scope.url_;

$scope.$on('$routeChangeStart', function(event,next,current) { 
    var data = next.$$route.originalPath;
    $scope.url_ = data;
})

$scope.load_data = function(v) {
    $scope.selectedMenu = v;
}

//Get Reviews Functions
$scope.get_tp = function(v) {
    $scope.fetch_tp = true;
    var query = {
        url : '/get_tp?v='+v,
    }
    request.query(query).then(function(res) {
        $scope.show_reviews = "Trustpilot Reviews";
        $scope.reviews = res.data;
        $scope.fetch_tp = false;
    })
}

$scope.get_fb = function(v) {
    $scope.fetch_fb = true;
    var query = {
        url : '/get_fb?v='+v,
    }
    request.query(query).then(function(res) {
        $scope.show_reviews = "Facebook Reviews";
        $scope.reviews = res.data;
        $scope.fetch_fb = false;
    })
}

$scope.get_gr = function(v) {
    $scope.fetch_gr = true;
    var query = {
        url : '/get_gr?v='+v,
    }
    request.query(query).then(function(res) {
        $scope.show_reviews = "Google Reviews";
        $scope.reviews = res.data;
        $scope.fetch_gr = false;
    })
}

});

app.controller('ModalCtrl', function($scope, $uibModal) {

    $scope.open = function() {
        var modalInstance =  $uibModal.open({
            templateUrl: "template/modalContent.htm",
            controller: "ModalContentCtrl",
            windowClass: 'show',
            backdrop: 'static',
            size: '',
        });
    };
})

app.controller('ModalContentCtrl', function(request, $scope, $window, $uibModalInstance) {
    $scope.data = {};

    $scope.submit = function() {
        $scope.add_site_details($scope.data.name, $scope.data.tp_url, $scope.data.fb_url, $scope.data.gr_url);

        $uibModalInstance.close("Ok");

        $window.location.reload();
    }

    $scope.add_site_details = function(name, tp, fb, gr) {
        var query = {
            url : '/add_site_details?name='+name+'&tp='+tp+'&fb='+fb+'&gr='+gr,
        }
        request.query(query).then(function(res) {
            //
        })
    }

    $scope.cancel = function($event){
        $event.preventDefault();
        $uibModalInstance.dismiss();
    }
});