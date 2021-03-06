var app = angular.module('notes', ['ngRoute','ngTouch','ngCookies','angular.filter', 'ui.bootstrap', 'ngSanitize', 'ngCsv']);
app.controller('ctrl', function($rootScope, $scope, $location,request, $window, fetch, $q, $sce, $http, $interval, $timeout, $filter){

var dataSource = $http.get('sites.json');

var jobs = {};
var stop = {};
var sites_not_run = [];
var listOfSitesWithNoLink = [];

$rootScope.numJobs = 0;
$rootScope.numStop = 0;

$rootScope.numSeq = 0;
$rootScope.run_twice_already = false;

$rootScope.filename = "";
$rootScope.getArray;
$scope.separator = "|";

$rootScope.platform = [
    { name: "Trustpilot", selected: true },
    { name: "Facebook", selected: true },
    { name: "GoogleReviews", selected: true }
];

$scope.getHeader = function () {return ["Site", "Social", "Date", "Acc name", "Review", "Reply", "review link"]};

if (dataSource) {
    dataSource.success(function(data) {
        $rootScope.menus = data;
        $rootScope.populateCsv();
    });
    dataSource.error(function(data) {
        alert("AJAX failed to load data.");
    });
}

$scope.url_;
$rootScope.run_all_flag;
$rootScope.menu_to_run = [];
$rootScope.menu_next = 0;

$scope.$on('$routeChangeStart', function(event,next,current) { 
    var data = next.$$route.originalPath;
    $scope.url_ = data;
})

$rootScope.populateCsv = function() {
    $rootScope.getArray = [];
    $rootScope.filename = $filter('date')(new Date(), 'yyyyMMddHHmm') + ".csv";
    $rootScope.menus.forEach(function(v) {
        $http.get('reviews/'+v.name+'_tp.json')
            .success(function(data) {
                data.splice(0,1);
                if (data) {
                    data.forEach(function(d) {
                        var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        $rootScope.getArray.push({a: v.name, b: "Trustpilot", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                    });
                }
            });

        $http.get('reviews/'+v.name+'_fb.json')
            .success(function(data) {
                data.splice(0,1);
                if (data) {
                    data.forEach(function(d) {
                        var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        $rootScope.getArray.push({a: v.name, b: "Facebook", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                    });
                }
            });


        $http.get('/reviews/'+v.name+'_gr.json')
            .success(function(data) {
                data.splice(0,1);
                if (data) {
                    data.forEach(function(d) {
                        var article =  (d.article) ? d.article.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        var replies =  (d.replies) ? d.replies.replace(/\n/g, " ").replace(/’/g, "'").replace(/‘/g, "'").replace(/“/g, "\"").replace(/”/g, "\"").replace(/—/g, "-").replace(/  /g, " ") : "";
                        $rootScope.getArray.push({a: v.name, b: "Google Reviews", c: $filter('date')(d.date, 'MMM dd yyyy'), d: d.account_name, e: article, f: replies, g: d.url});
                    });
                }

            });
    });
}

$scope.load_data = function(v) {
    $rootScope.reviews = [];
    $rootScope.dateLastUpdated = null;
    $rootScope.show_reviews = "";
    $rootScope.selectedMenu = v;
}

async function updateJobs() {
    for (let id of Object.keys(jobs)) {
        var query = {
            url : '/job/'+id+'?name='+jobs[id].name,
        }
        request.query(query).then(function(res) {
            if (res.data.reviews !== null || res.data.status == 404) {
                $interval.cancel(stop[id]);

                var hasDuplicate = false;
                res.data.reviews.map(v => v.url).sort().sort((a, b) => {
                  if (a === b) hasDuplicate = true
                })

                if (hasDuplicate || (res.data.reviews.length <= 21 && !$rootScope.run_twice_already && $rootScope.run_all_flag)) {
                    $rootScope.run_twice_already = true;
                    if ($rootScope.numSeq == 1) {
                        if ($rootScope.menu_next > 0) {
                            $rootScope.numSeq = 3;
                            $rootScope.menu_next--;
                        } else {
                            $rootScope.numSeq = 1;
                        }
                    } else {
                        $rootScope.numSeq--;
                    }

                    // $rootScope.numStop++;
                } else {
                    $rootScope.run_twice_already = false;
                    if (res.data.status == 404) {
                        sites_not_run.push(jobs[id].site + " (" + jobs[id].social + ")");
                    }

                    $rootScope.numStop--;
                }
                
                delete stop[id];
                delete jobs[id];

                $rootScope.menu_to_run_func();
            }

            checkIfStop();
        });
    }
}

$rootScope.menu_to_run_func = function() {
    if ($rootScope.menu_next < $rootScope.menu_to_run.length && $rootScope.run_all_flag) {
        var flag = false;

        while(!flag) {
            var menu = $rootScope.menu_to_run[$rootScope.menu_next];
            if ($rootScope.numSeq == 1 && $rootScope.platform[2].selected) {
                $timeout(function() {$rootScope.get_gr(menu);console.log(menu.name + "_gr");}, 4000)

                flag = true;
            } else if ($rootScope.numSeq == 2 && $rootScope.platform[1].selected) {
                $timeout(function() {$rootScope.get_fb(menu);console.log(menu.name + "_fb");}, 4000)
                
                flag = true;
            } else if ($rootScope.numSeq == 3) {
                if ($rootScope.platform[0].selected) {
                    $timeout(function() {$rootScope.get_tp(menu);console.log(menu.name + "_tp");}, 4000)
                    
                    flag = true;
                }

                $rootScope.menu_next++;
                $rootScope.numSeq = 0;
            }

            $rootScope.numSeq++;
        }
    }
}

function checkIfStop() {
    if ($rootScope.numStop <= 0) {
        $rootScope.run_all_status = "Run All Completed";
        console.log("Run All Completed");
        $scope.fetch_tp = false;
        $scope.fetch_fb = false;
        $scope.fetch_gr = false;

        if (sites_not_run.length > 0) {
            var sites_text = sites_not_run[0];

            for (let i = 1; i < sites_not_run.length; i++) {
                sites_text += "\n" + sites_not_run[i];
            }

            alert("Sites not run:\n\n" + sites_text);

            sites_not_run = [];
        }

        if (listOfSitesWithNoLink.length > 0) {
            var sites_text = listOfSitesWithNoLink[0];

            for (let i = 1; i < listOfSitesWithNoLink.length; i++) {
                sites_text += "\n" + listOfSitesWithNoLink[i];
            }

            alert("Sites with no links:\n\n" + sites_text);

            listOfSitesWithNoLink = [];
        }

        $rootScope.populateCsv();
        $rootScope.run_all_flag = false;
        $rootScope.menu_next = 0;
    } else {
        console.log("Progress... "+(($rootScope.numJobs-$rootScope.numStop)/$rootScope.numJobs*100).toFixed(2)+"%");
        $rootScope.run_all_status = "Progress... "+(($rootScope.numJobs-$rootScope.numStop)/$rootScope.numJobs*100).toFixed(2)+"%";
    }
}

$scope.run_all = function() {
    $rootScope.run_all_flag = true;
    $rootScope.run_all_status = "Progress... 0.00%";
    $rootScope.menu_to_run = $rootScope.menus;

    $rootScope.refreshFiles();

    // $timeout(function() {$rootScope.get_gr($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_gr");}, 2000)
    $rootScope.numSeq = 1;

    $rootScope.numJobs = $rootScope.menu_to_run.length * 3;
    $rootScope.numStop = $rootScope.menu_to_run.length * 3;

    $rootScope.menu_to_run_func();
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
        if (!$rootScope.run_all_flag && v.tp == "") {
            alert("Trustpilot link is not provided");
        } else if (v.tp != "") {
            var query = {
                url : '/job_tp?v='+v.tp,
            }

            $scope.fetch_tp = true;
            $rootScope.reviews = [];
            $rootScope.dateLastUpdated = null;

            request.query(query).then(function(res) {
                jobs[res.data.id] = { id: res.data.id, name: v.name + '_tp', site: v.name, social: 'Trustpilot' };
                if (!$rootScope.run_all_flag) {
                    $rootScope.run_all_status = "Progress... 0.00%";
                    $rootScope.numJobs++;
                    $rootScope.numStop++;
                }

                stop[res.data.id] = $interval(updateJobs, 10000);
            })
        } else {
            $rootScope.numStop--;
            listOfSitesWithNoLink.push(v.name + " (Trustpilot)");

            $rootScope.menu_to_run_func();
            checkIfStop();
        }
    }
}

$rootScope.get_fb = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        if (!$rootScope.run_all_flag && v.fb == "") {
            alert("Facebook link is not provided");
        } else if (v.fb != "") {
            var query = {
                url : '/job_fb?v='+v.fb,
            }

            $scope.fetch_fb = true;
            $rootScope.reviews = [];
            $rootScope.dateLastUpdated = null;

            request.query(query).then(function(res) {
                jobs[res.data.id] = { id: res.data.id, name: v.name + '_fb', site: v.name, social: 'Facebook' };
                if (!$rootScope.run_all_flag) {
                    $rootScope.run_all_status = "Progress... 0.00%";
                    $rootScope.numJobs++;
                    $rootScope.numStop++;
                }

                stop[res.data.id] = $interval(updateJobs, 10000);
            })
        } else {
            $rootScope.numStop--;
            listOfSitesWithNoLink.push(v.name + " (Facebook)");

            $rootScope.menu_to_run_func();
            checkIfStop();
        }
    }
}

$rootScope.get_gr = function(v) {
    if ((!$scope.fetch_tp && !$scope.fetch_fb && !$scope.fetch_gr) || $rootScope.run_all_flag) {
        if (!$rootScope.run_all_flag && v.gr == "") {
            alert("Google Reviews link is not provided");
        } else if (v.gr != "") {
            var query = {
                url : '/job_gr?v='+v.gr,
            }

            $scope.fetch_gr = true;
            $rootScope.reviews = [];
            $rootScope.dateLastUpdated = null;

            request.query(query).then(function(res) {
                jobs[res.data.id] = { id: res.data.id, name: v.name + '_gr', site: v.name, social: 'Google Reviews' };
                if (!$rootScope.run_all_flag) {
                    $rootScope.run_all_status = "Progress... 0.00%";
                    $rootScope.numJobs++;
                    $rootScope.numStop++;
                }

                stop[res.data.id] = $interval(updateJobs, 10000);
            })
        } else {
            $rootScope.numStop--;
            listOfSitesWithNoLink.push(v.name + " (Google Reviews)");

            $rootScope.menu_to_run_func();
            checkIfStop();
        }
    }
}

$scope.show_tp = function(name) {
    var query = {
        url : '/get_tp_reviews?name='+name
    }

    $rootScope.show_reviews = "Trustpilot Reviews";

    request.query(query).then(function(res) {
        if (res.data.date.length > 0 && res.data.reviews.length > 0) {
            $rootScope.dateLastUpdated = new Date(res.data.date[0].date);
        } else {
            $rootScope.dateLastUpdated = null;
        }
        $rootScope.reviews = res.data.reviews;
    });
}

$scope.show_fb = function(name) {
    var query = {
        url : '/get_fb_reviews?name='+name
    }

    $rootScope.show_reviews = "Facebook Reviews";

    request.query(query).then(function(res) {
        if (res.data.date.length > 0 && res.data.reviews.length > 0) {
            $rootScope.dateLastUpdated = new Date(res.data.date[0].date);
        } else {
            $rootScope.dateLastUpdated = null;
        }
        $rootScope.reviews = res.data.reviews;
    });
}

$scope.show_gr = function(name) {
    var query = {
        url : '/get_gr_reviews?name='+name
    }

    $rootScope.show_reviews = "Google Reviews";

    request.query(query).then(function(res) {
        if (res.data.date.length > 0 && res.data.reviews.length > 0) {
            $rootScope.dateLastUpdated = new Date(res.data.date[0].date);
        } else {
            $rootScope.dateLastUpdated = null;
        }
        $rootScope.reviews = res.data.reviews;
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

    $scope.run_disabled = true;

    $scope.data.push({name: "All", selected: false});

    $rootScope.menus.forEach(function(v) {
        v.selected = false;
        $scope.data.push(v);
    });

    var platformFlag = false;
    var run_flag = true;

    $scope.checkPlatform = function() {
        platformFlag = true;
        $rootScope.platform.forEach(function(v) {
            if (v.selected) platformFlag = false;
        });
        $scope.run_disabled = platformFlag || run_flag;
    }

    $scope.checkSites = function(index, value) {
        run_flag = true;
        if (index == 0) {
            $scope.data.forEach(function(v) {
                v.selected = value.selected ? true : false;
            });
            $scope.run_disabled = !value.selected || platformFlag;
            run_flag = !value.selected;
        } else {
            var selected_flag = true;
            $scope.data.forEach(function(v,i) {
                if (!v.selected && i != 0) {
                    selected_flag = false;
                }
                if (v.selected) {
                    run_flag = false;
                }
            });

            $scope.data[0].selected = selected_flag;
            $scope.run_disabled = platformFlag || run_flag;
        }
    }

    $scope.submit = function() {
        $scope.run_selected();

        $uibModalInstance.close("Ok");
    }

    $scope.run_selected = function() {
        $rootScope.run_all_flag = true;
        $rootScope.run_all_status = "Progress... 0.00%";
        $rootScope.menu_to_run = [];

        $rootScope.refreshFiles();

        $scope.data.forEach(function(v,i) {
            if (v.selected && i != 0) {
                $rootScope.menu_to_run.push(v);
            }
        });

        $rootScope.numSeq = 1;

        var count = 0;

        $rootScope.platform.forEach(function(v) {
            if (v.selected) count++;
        });

        // $timeout(function() {$rootScope.get_gr($rootScope.menu_to_run[0]);console.log($rootScope.menu_to_run[0].name + "_gr");}, 2000)
        
        $rootScope.numJobs = $rootScope.menu_to_run.length * count;
        $rootScope.numStop = $rootScope.menu_to_run.length * count;

        $rootScope.menu_to_run_func();
    }

    $scope.cancel = function($event){
        $event.preventDefault();

        $rootScope.platform = [
            { name: "Trustpilot", selected: true },
            { name: "Facebook", selected: true },
            { name: "GoogleReviews", selected: true }
        ];
        
        $uibModalInstance.dismiss();
    }
});

app.controller('ModalCtrl', function(request, $rootScope, $scope, $uibModal) {
    $scope.open = function(type) {
        var templateUrl;
        
        if (type == 'add') {
            $rootScope.type = 'add';
            templateUrl = "template/addModalContent.htm";
        } else if (type == 'edit') {
            $rootScope.type = 'edit';
            templateUrl = "template/editModalContent.htm";
        } else if (type == 'delete') {
            $rootScope.type = 'delete';
            templateUrl = "template/deleteModalContent.htm";
        }

        $uibModal.open({
            templateUrl: templateUrl,
            controller: "ModalContentCtrl",
            windowClass: 'show',
            backdrop: 'static',
            size: '',
        });
    };
});

app.controller('ModalContentCtrl', function(request, $rootScope, $scope, $window, $uibModalInstance) {
    if ($rootScope.type == 'edit' || $rootScope.type == 'delete') {
        $scope.data = {
            name: $rootScope.selectedMenu.name,
            tp_url: $rootScope.selectedMenu.tp,
            fb_url: $rootScope.selectedMenu.fb,
            gr_url: $rootScope.selectedMenu.gr
        }
    } else {
        $scope.data = {
            name: '',
            tp_url: '',
            fb_url: '',
            gr_url: '',
        };
    }

    $scope.submit = function() {
        if ($rootScope.type == 'edit') {
            $scope.edit_site_details($rootScope.selectedMenu.name, $scope.data.name, $scope.data.tp_url, $scope.data.fb_url, $scope.data.gr_url);

            $uibModalInstance.close("Ok");

            $window.location.reload();
        } else if ($rootScope.type == 'delete') {
            $scope.delete_site_details($rootScope.selectedMenu.name);
            
            $uibModalInstance.close("Ok");

            $window.location.reload();
        } else {
            if ($scope.data.tp_url.trim() != "" || $scope.data.fb_url.trim() != "" || $scope.data.gr_url.trim() != "") {
                $scope.add_site_details($scope.data.name, $scope.data.tp_url, $scope.data.fb_url, $scope.data.gr_url);
                
                $uibModalInstance.close("Ok");

                $window.location.reload();
            } else {
                alert("At least one URL must be provided!");
            }
        }
    }

    $scope.delete_site_details = function(name) {
        var query = {
            url : '/delete_site_details?name='+name,
        }
        request.query(query).then(function(res) {
            //
        })
    }

    $scope.edit_site_details = function(oldname, newname, tp, fb, gr) {
        var query = {
            url : '/edit_site_details?oldname='+oldname+'&newname='+newname+'&tp='+tp+'&fb='+fb+'&gr='+gr,
        }
        request.query(query).then(function(res) {
            //
        })
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