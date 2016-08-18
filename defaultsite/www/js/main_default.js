var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 
	
	$scope.sections={};
	

	
	$scope.parkingService = function() {
		if (!$scope.sections.git_form) $scope.sections.git_form = true;	
		else $scope.sections.git_form = false;	
		
	}
	
	$scope.listService = function() {
		if (!$scope.sections.service_list) $scope.sections.service_list = true;	
		else $scope.sections.service_list = false;	
		
	}	
	
	$scope.report = function() {
		$scope.popup('on', {
			title:'Report',
			body: $sce.trustAsHtml('Under construction<br/><img src="/images/Under-Construction.gif">&hellip;')
		});			
		
	}
	
	$scope.progress = function(code, message) {
		$scope.progress_message = message;
		if (code == 'on') {
			$('.qalet_loading_progress_bar').modal();
			
		} else if (code == 'fastoff')  {
			$('.qalet_loading_progress_bar').removeClass("fade").modal('hide');
		} else {
			$('.qalet_loading_progress_bar').modal('hide');
		}
	}	
	
	$scope.popup = function(code, message) {
		$scope.popup_message = message;
		if (code == 'on') {
			$('.qalet_popup').modal();
		} else {
			$('.qalet_popup').modal('hide');
		}
	}	
	
});	


app.config(function($routeProvider) {
	$routeProvider.when('/microservices',   {templateUrl: '/uiview/micro_services.html', reloadOnSearch: false, controller:'microservicesController'});
	$routeProvider.when('/plugin',   {templateUrl: '/uiview/coming_soon.html', reloadOnSearch: false});
	$routeProvider.when('/document',   {templateUrl: '/uiview/qalet_document.html', reloadOnSearch: false});
	$routeProvider.when('/home',   {templateUrl: '/uiview/qalet_home.html', reloadOnSearch: false});
	$routeProvider.when('/',   {templateUrl: '/uiview/qalet_home.html', reloadOnSearch: false});
});
 


app.controller('microservicesController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 


	$scope.rebootServer = function() {
		$scope.$parent.progress('on', ' Sending reboot request ...');
		$http({
		  method: 'GET',
		  url: '/_git/reboot'
		}).then(function successCallback(response) {
			$scope.$parent.progress('off');
			$scope.$parent.popup('on', {
				title:'Success',
				body: $sce.trustAsHtml(response.data)
			});				
		  }, function errorCallback(response) {
				$scope.progress('off');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response)
				});						
			});				
		
	}	
	

	$scope.updateGit = function(v) {
		$scope.$parent.progress('on', 'Git pull ' + ((v)?v:' All seervices ') + ' ...');
		$http({
		  method: 'GET',
		  url: '/_git/' + ((v)?v:'')
		}).then(function successCallback(response) {
			$scope.$parent.progress('off');
			$scope.$parent.popup('on', {
				title:'Success done git update',
				body: $sce.trustAsHtml(response.data)
			});				
		  }, function errorCallback(response) {
				$scope.progress('off');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response)
				});						
			});	
		
	}

	$scope.postVhost = function() {
		$scope.$parent.progress('on', 'post form');
		$http({
		  method: 'POST',
		  url: '/_git/postVhost',
		  data: $scope.form
		}).then(function successCallback(response) {
			if (response.data.status == 'success') {
				var data = response.data;
				delete $scope.form;	
				$scope.$parent.progress('fastoff');
				$scope.listVhost();				
			} else {
				$scope.$parent.progress('off');				
				
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response.data.message)
				});	
			}

		  }, function errorCallback(response) {
				$scope.$parent.progress('off');		
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response.data)
				});						
			});			
	};

	$scope.removeVhost = function(v) {
		$scope.$parent.progress('on', ' Remove service ...');
		$http({
		  method: 'POST',
		  url: '/_git/removeVhost',
		  data: v
		}).then(function successCallback(response) {
			$scope.$parent.progress('fastoff');
			$scope.listVhost();
		  }, function errorCallback(response) {	
				$scope.$parent.progress('fastoff');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response.data)
				});						
			});			
	};	

	$scope.loadDemo = function(v) {
		$scope.$parent.progress('on', ' Load demo service ...');
		$http({
		  method: 'POST',
		  url: '/_git/loadDemo',
		  data: v
		}).then(function successCallback(response) {
			$scope.$parent.progress('fastoff');
			$scope.listVhost();
		  }, function errorCallback(response) {	
				$scope.$parent.progress('fastoff');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response.data)
				});						
			});			
	};	
	
	$scope.editVhost = function(v) {
		if (v === false) delete $scope.form;
		else $scope.form = v;		
	};	
	
	$scope.listVhost = function() {
		$scope.$parent.progress('on', 'get list');
		$http({
		  method: 'GET',
		  url: '/_git/list'
		}).then(function successCallback(response) {
			$scope.microservice_list = response.data;
			$scope.$parent.progress('off');		
		  }, function errorCallback(response) {
				$scope.$parent.progress('off');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response)
				});						
			});			
	}
	$scope.listVhost();


});	

