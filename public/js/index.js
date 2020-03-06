var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter', 'ui.bootstrap', 'ngSanitize', 'ngCsv']);
app.controller('ctrl', function($rootScope, $scope, $location,request, $window, fetch, $q, $sce, $http, $interval, $timeout, $filter){

var dataSource = $http.get('sites.json');

var jobs = {};
var stop = {};
var numJobs = 0;

$scope.filename = $filter('date')(new Date(), 'yyyyMMddHHmm');
$scope.getArray = [];
$scope.separator = "|";

$scope.getHeader = function () {return ["Site", "Social", "Date", "Acc name", "Review", "Reply", "review link"]};

if (dataSource) {
    dataSource.success(function(data) {
        $rootScope.menus = data;
    });
    dataSource.error(function(data) {
        alert("AJAX failed to load data.");
    });
}

$scope.url_;
$rootScope.run_all_flag;
$scope.canExportFlag;

$scope.$on('$routeChangeStart', function(event,next,current) { 
    var data = next.$$route.originalPath;
    $scope.url_ = data;
})

function populateCsv() {
    $rootScope.menus.forEach(function(v) {
        $http.get('reviews/'+v.name+'_tp.json').success(function(data) {
            data.forEach(function(d) {
                $scope.getArray.push({a: v.name, b: "Trustpilot", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: d.article, f: d.replies, g: d.url});
            });
        });

        console.log($scope.getArray);

        $http.get('reviews/'+v.name+'_fb.json').success(function(data) {
            data.forEach(function(d) {
                $scope.getArray.push({a: v.name, b: "Facebook", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: d.article, f: d.replies, g: d.url});
            });
        });

        $http.get('/reviews/'+v.name+'_gr.json').success(function(data) {
            data.forEach(function(d) {
                $scope.getArray.push({a: v.name, b: "Google Reviews", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: d.article, f: d.replies, g: d.url});
            });
        });
    });

    if ($scope.getArray.length > 0) {
        $scope.canExportFlag = true;
    } else {
        $scope.canExportFlag = false;
    }
}

$scope.load_data = function(v) {
    $scope.selectedMenu = v;
    $scope.reviews = null;
    populateCsv();
}

// async function updateJobs() {
//     for (let id of Object.keys(jobs)) {
//         var query = {
//             url : '/job/'+id,
//         }
//         request.query(query).then(function(res) {
//             if (!!jobs[id]) {
//                 $scope.reviews = res.data.reviews;
//                 if (res.data.reviews !== null) {
//                     $scope.fetch_tp = false;
//                     $scope.fetch_fb = false;
//                     $scope.fetch_gr = false;
//                     $interval.cancel(stop);
//                     jobs = {};
//                 }
//             }
//         });
//     }
// }

async function updateJobs() {
    for (let id of Object.keys(jobs)) {
        var query = {
            url : '/job/'+id+'?name='+jobs[id].name,
        }
        request.query(query).then(function(res) {
            if (!!jobs[id]) {
                if (res.data.reviews !== null) {
                    $interval.cancel(stop[id]);
                    delete stop[id];
                    delete jobs[id];
                }
            }
            if (isEmpty(stop)) {
                $scope.fetch_tp = false;
                $scope.fetch_fb = false;
                $scope.fetch_gr = false;
                $scope.run_all_status = "Run All Completed";
                console.log("Run All Completed");
                $rootScope.run_all_flag = false;
                populateCsv();
            } else {
                console.log("Progress... "+((numJobs-Object.keys(stop).length)/numJobs*100).toFixed(2)+"%");
                $scope.run_all_status = "Progress... "+((numJobs-Object.keys(stop).length)/numJobs*100).toFixed(2)+"%";
            }
        });
    }
}

// async function get_all_reviews(v) {
//     var tp_query = {
//         url : '/job_tp?v='+v.tp,
//     }
//     var fb_query = {
//         url : '/job_fb?v='+v.fb,
//     }
//     var gr_query = {
//         url : '/job_gr?v='+v.gr,
//     }

//     $scope.reviews = [];

//     request.query(tp_query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })

//     request.query(fb_query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })

//     request.query(gr_query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })
// }

$scope.run_all = function() {
    $rootScope.run_all_flag = true;

    $rootScope.menus.forEach(function(v) {
        console.log(v.name);
        // get_all_reviews(v);
        $timeout(function() {$rootScope.get_tp(v);console.log('1');}, 2000)
        
        $timeout(function() {$rootScope.get_fb(v);console.log('2');}, 4000)
        
        $timeout(function() {$rootScope.get_gr(v);console.log('3');}, 6000)
        
    });
}

//Get Reviews Functions
// get_tp = function(v) {
//     $scope.fetch_tp = true;
//     var query = {
//         url : '/job_tp?v='+v.tp,
//     }

//     $scope.reviews = [];

//     request.query(query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id, name: v.name + '_tp' };
//     })

//     stop = $interval(updateJobs, 8000);
// }

$rootScope.get_tp = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        var query = {
            url : '/job_tp?v='+v.tp,
        }

        $scope.fetch_tp = true;
        $scope.reviews = [];

        request.query(query).then(function(res) {
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_tp' };
            numJobs++;

            stop[res.data.id] = $interval(updateJobs, 8000);
        })
    }
}

$rootScope.get_fb = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        var query = {
            url : '/job_fb?v='+v.fb,
        }

        $scope.fetch_fb = true;
        $scope.reviews = [];

        request.query(query).then(function(res) {
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_fb' };
            numJobs++;

            stop[res.data.id] = $interval(updateJobs, 8000);
        })
    }
}

$rootScope.get_gr = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        var query = {
            url : '/job_gr?v='+v.gr,
        }

        $scope.fetch_gr = true;
        $scope.reviews = [];

        request.query(query).then(function(res) {
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_gr' };
            numJobs++;

            stop[res.data.id] = $interval(updateJobs, 8000);
        })
    }
}

$scope.show_tp = function(name) {
    var query = {
        url : '/get_tp_reviews?name='+name
    }

    $scope.show_reviews = "Trustpilot Reviews";

    request.query(query).then(function(res) {
        $scope.reviews = res.data.reviews;
    });
}

$scope.show_fb = function(name) {
    var query = {
        url : '/get_fb_reviews?name='+name
    }

    $scope.show_reviews = "Facebook Reviews";

    request.query(query).then(function(res) {
        $scope.reviews = res.data.reviews;
    });
}

$scope.show_gr = function(name) {
    var query = {
        url : '/get_gr_reviews?name='+name
    }

    $scope.show_reviews = "Google Reviews";

    request.query(query).then(function(res) {
        $scope.reviews = res.data.reviews;
    });
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// $scope.get_tp = function(v) {
//     $scope.fetch_tp = true;
//     var query = {
//         url : '/job_tp?v='+v,
//     }

//     $scope.show_reviews = "Trustpilot Reviews";
//     $scope.reviews = [];

//     request.query(query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })

//     stop = $interval(updateJobs, 8000);
// }

// $scope.get_fb = function(v) {
//     $scope.fetch_fb = true;
//     var query = {
//         url : '/job_fb?v='+v,
//     }

//     $scope.show_reviews = "Facebook Reviews";
//     $scope.reviews = [];

//     request.query(query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })

//     stop = $interval(updateJobs, 8000);
// }

// $scope.get_gr = function(v) {
//     $scope.fetch_gr = true;
//     var query = {
//         url : '/job_gr?v='+v,
//     }

//     $scope.show_reviews = "Google Reviews";
//     $scope.reviews = [];

//     request.query(query).then(function(res) {
//         jobs[res.data.id] = { id: res.data.id };
//     })

//     stop = $interval(updateJobs, 8000);
// }
});

app.controller('RunModalCtrl', function($scope, $uibModal) {

    $scope.open = function() {
        var modalInstance =  $uibModal.open({
            templateUrl: "template/runModalContent.htm",
            controller: "RunModalContentCtrl",
            windowClass: 'show',
            backdrop: 'static',
            size: '',
        });
    };
})

app.controller('RunModalContentCtrl', function($timeout, $rootScope, request, $scope, $window, $uibModalInstance) {
    $scope.data = [];

    $rootScope.menus.forEach(function(v) {
        v.selected = false;
        $scope.data.push(v);
    });

    $scope.submit = function() {
        console.log($scope.data);

        $scope.run_selected();

        $uibModalInstance.close("Ok");
    }

    $scope.run_selected = function() {
        $rootScope.run_all_flag = true;

        $scope.data.forEach(function(v) {
            if (v.selected) {
                console.log(v.name);
                // get_all_reviews(v);
                $timeout(function() {$rootScope.get_tp(v);console.log('1');}, 2000)
                
                $timeout(function() {$rootScope.get_fb(v);console.log('2');}, 4000)
                
                $timeout(function() {$rootScope.get_gr(v);console.log('3');}, 6000)
            }
            
        });
    }

    $scope.cancel = function($event){
        $event.preventDefault();
        $uibModalInstance.dismiss();
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
});

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