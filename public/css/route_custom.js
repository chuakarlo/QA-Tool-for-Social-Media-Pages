app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    //locator routing
    when('/', {
      templateUrl: './template/dashboard.htm',
      controller: 'ctrl',
    }).
    when('/contacts', {
      templateUrl: './template/contacts.htm',
      controller: 'ctrl',
    }).
    when('/emails', {
      templateUrl: './template/emails.htm',
      controller: 'ctrl',
    }).   
    when('/sales', {
      templateUrl: './template/sales.htm',
      controller: 'ctrl',
    }).  
    when('/settings', {
      templateUrl: './template/settings.htm',
      controller: 'ctrl',
    }).              
    otherwise({
       redirectTo: '/'
    });
 }]);