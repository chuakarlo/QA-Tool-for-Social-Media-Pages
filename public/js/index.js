var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter', 'ui.bootstrap']);
app.controller('ctrl', function($scope, $location,request,$window,fetch,$q, $sce, $http, $interval){

var dataSource = $http.get('sites.json');

var jobs = {};
var stop;

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

async function updateJobs() {
    for (let id of Object.keys(jobs)) {
        var query = {
            url : '/job/'+id,
        }
        request.query(query).then(function(res) {
            if (!!jobs[id]) {
                $scope.reviews = res.data.reviews;
                if (res.data.reviews !== null) {
                    $scope.fetch_tp = false;
                    $scope.fetch_fb = false;
                    $scope.fetch_gr = false;
                    $interval.cancel(stop);
                    jobs = {};
                }
            }
        });
    }
}

//Get Reviews Functions
$scope.get_tp = function(v) {
    $scope.fetch_tp = true;
    var query = {
        url : '/job_tp?v='+v,
    }

    request.query(query).then(function(res) {
        $scope.show_reviews = "Trustpilot Reviews";
        jobs[res.data.id] = { id: res.data.id };
    })

    stop = $interval(updateJobs, 8000);
}

$scope.get_fb = function(v) {
    $scope.fetch_fb = true;
    var query = {
        url : '/job_fb?v='+v,
    }

    request.query(query).then(function(res) {
        $scope.show_reviews = "Facebook Reviews";
        jobs[res.data.id] = { id: res.data.id };
    })

    stop = $interval(updateJobs, 8000);
}

$scope.get_gr = function(v) {
    $scope.fetch_gr = true;
    var query = {
        url : '/job_gr?v='+v,
    }

    request.query(query).then(function(res) {
        $scope.show_reviews = "Trustpilot Reviews";
        jobs[res.data.id] = { id: res.data.id };
    })

    stop = $interval(updateJobs, 8000);
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