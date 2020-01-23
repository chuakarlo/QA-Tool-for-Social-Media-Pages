app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    //locator routing
    when('/', {
      templateUrl: './template/main.htm',
      controller: 'ctrl',
    }).
    when('/mysuccess', {
      templateUrl: './template/mysuccess.htm',
      controller: 'ctrl',
    }).
    when('/coaching', {
      templateUrl: './template/coaching.htm',
      controller: 'ctrl',
    }).   
    when('/visionary', {
      templateUrl: './template/visionary.htm',
      controller: 'ctrl',
    }). 
    when('/onlinesuccess', {
      templateUrl: './template/onlinesuccess.htm',
      controller: 'ctrl',
    }).       
    when('/supportservice', {
      templateUrl: './template/supportservice.htm',
      controller: 'ctrl',
    }).     
    when('/driveforsuccess', {
      templateUrl: './template/driveforsuccess.htm',
      controller: 'ctrl',
    }).  
    when('/topcoach', {
      templateUrl: './template/topcoach.htm',
      controller: 'ctrl',
    }).  
    when('/upservice', {
      templateUrl: './template/upservice.htm',
      controller: 'ctrl',
    }).                       
    otherwise({
       redirectTo: '/'
    });
 }]);