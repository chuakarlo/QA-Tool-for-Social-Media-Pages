var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter', 'ui.bootstrap', 'ngSanitize', 'ngCsv']);
app.controller('ctrl', function($rootScope, $scope, $location,request, $window, fetch, $q, $sce, $http, $interval, $timeout, $filter){

var dataSource = $http.get('sites.json');

var jobs = {};
var stop = {};
var sites_not_run = [];

$rootScope.numJobs = 0;
$rootScope.numStop = 0;

$scope.filename = $filter('date')(new Date(), 'yyyyMMddHHmm') + ".csv";
$scope.getArray = [];
$scope.separator = "|";

$scope.getHeader = function () {return ["Site", "Social", "Date", "Acc name", "Review", "Reply", "review link"]};

if (dataSource) {
    dataSource.success(function(data) {
        $rootScope.menus = data;
        populateCsv();
    });
    dataSource.error(function(data) {
        alert("AJAX failed to load data.");
    });
}

$scope.url_;
$rootScope.run_all_flag;
$rootScope.menu_to_run = [];
$rootScope.menu_next = 0;
$scope.canExportFlag;

$scope.$on('$routeChangeStart', function(event,next,current) { 
    var data = next.$$route.originalPath;
    $scope.url_ = data;
})

function populateCsv() {
    $scope.getArray = [];
    $rootScope.menus.forEach(function(v) {
        var tp_get = $http.get('reviews/'+v.name+'_tp.json');

        tp_get.success(function(data) {
            if (data) {
                data.forEach(function(d) {
                    var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    $scope.getArray.push({a: v.name, b: "Trustpilot", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                });
            }
        });
        tp_get.error(function(error) {
            
        });

        var fb_get = $http.get('reviews/'+v.name+'_fb.json');
        fb_get.success(function(data) {
            if (data) {
                data.forEach(function(d) {
                    var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    $scope.getArray.push({a: v.name, b: "Facebook", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                });
            }
        });
        fb_get.error(function(error) {
            
        });

        var gr_get = $http.get('/reviews/'+v.name+'_gr.json');
        gr_get.success(function(data) {
            if (data) {
                data.forEach(function(d) {
                    var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'") : "";
                    $scope.getArray.push({a: v.name, b: "Google Reviews", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                });
            }
        });
        gr_get.error(function(error) {
            
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
}

async function updateJobs() {
    for (let id of Object.keys(jobs)) {
        var query = {
            url : '/job/'+id+'?name='+jobs[id].name,
        }
        request.query(query).then(function(res) {
            if (!!jobs[id]) {
                if (res.data.reviews !== null || res.status != 200) {
                    $interval.cancel(stop[id]);

                    if (res.status != 200) {
                        sites_not_run.push(jobs[id].site + " (" + jobs[id].social + ")");
                    }
                    
                    delete stop[id];
                    delete jobs[id];

                    $rootScope.numStop--;

                    if ($rootScope.menu_next < $rootScope.menu_to_run.length && Object.keys(jobs).length == 1) {
                        var menu = $rootScope.menu_to_run[$rootScope.menu_next];
                        $timeout(function() {$rootScope.get_tp(menu);console.log(menu.name + "_tp");}, 2000)
            
                        $timeout(function() {$rootScope.get_fb(menu);console.log(menu.name + "_fb");}, 4000)
                        
                        $timeout(function() {$rootScope.get_gr(menu);console.log(menu.name + "_gr");}, 6000)

                        $rootScope.menu_next++;
                    }
                }
            }
            if ($rootScope.numStop == 0) {
                $rootScope.menu_next = 0;
                $scope.fetch_tp = false;
                $scope.fetch_fb = false;
                $scope.fetch_gr = false;
                $rootScope.run_all_status = "Run All Completed";
                console.log("Run All Completed");
                $rootScope.run_all_flag = false;
                populateCsv();

                if (sites_not_run.length > 0) {
                    var sites_text = sites_not_run[0];

                    for (let i = 1; i < sites_not_run.length; i++) {
                        sites_text += "\n" + sites_not_run[i];
                    }

                    alert("Sites not run:\n\n" + sites_text);

                    sites_not_run = [];
                }
            } else {
                console.log("Progress... "+(($rootScope.numJobs-$rootScope.numStop)/$rootScope.numJobs*100).toFixed(2)+"%");
                $rootScope.run_all_status = "Progress... "+(($rootScope.numJobs-$rootScope.numStop)/$rootScope.numJobs*100).toFixed(2)+"%";
            }
        });
    }
}

$scope.run_all = function() {
    $rootScope.run_all_flag = true;
    $rootScope.run_all_status = "Progress... 0.00%";
    $rootScope.menu_to_run = $rootScope.menus;

    $rootScope.refreshFiles();

    $timeout(function() {$rootScope.get_tp($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_tp");}, 2000)
        
    $timeout(function() {$rootScope.get_fb($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_fb");}, 4000)
    
    $timeout(function() {$rootScope.get_gr($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_gr");}, 6000)

    $rootScope.menu_next = 1;

    $rootScope.numJobs = $rootScope.menu_to_run.length * 3;
    $rootScope.numStop = $rootScope.menu_to_run.length * 3;
}

$rootScope.refreshFiles = function() {
    var query = {
        url : '/refreshFiles'
    }

    request.query(query).then(function() {
        console.log('Files refreshed');
    });
}

$rootScope.get_tp = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        var query = {
            url : '/job_tp?v='+v.tp,
        }

        $scope.fetch_tp = true;
        $scope.reviews = [];

        request.query(query).then(function(res) {
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_tp', site: v.name, social: 'Trustpilot' };
            if (!$rootScope.run_all_flag) {
                // $rootScope.refreshFiles();
                $rootScope.run_all_status = "Progress... 0.00%";
                $rootScope.numJobs++;
                $rootScope.numStop++;
            }

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
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_fb', site: v.name, social: 'Facebook' };
            if (!$rootScope.run_all_flag) {
                // $rootScope.refreshFiles();
                $rootScope.run_all_status = "Progress... 0.00%";
                $rootScope.numJobs++;
                $rootScope.numStop++;
            }

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
            jobs[res.data.id] = { id: res.data.id, name: v.name + '_gr', site: v.name, social: 'Google Reviews' };
            if (!$rootScope.run_all_flag) {
                // $rootScope.refreshFiles();
                $rootScope.run_all_status = "Progress... 0.00%";
                $rootScope.numJobs++;
                $rootScope.numStop++;
            }

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
        $scope.run_selected();

        $uibModalInstance.close("Ok");
    }

    $scope.run_selected = function() {
        $rootScope.run_all_flag = true;
        $rootScope.run_all_status = "Progress... 0.00%";
        $rootScope.menu_to_run = [];

        $rootScope.refreshFiles();

        $scope.data.forEach(function(v) {
            if (v.selected) {
                $rootScope.menu_to_run.push(v);
            }
        });

        $timeout(function() {$rootScope.get_tp($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_tp");}, 2000)
        
        $timeout(function() {$rootScope.get_fb($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_fb");}, 4000)
        
        $timeout(function() {$rootScope.get_gr($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_gr");}, 6000)

        $rootScope.numJobs = $rootScope.menu_to_run.length * 3;
        $rootScope.numStop = $rootScope.menu_to_run.length * 3;

        $rootScope.menu_next = 1;
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