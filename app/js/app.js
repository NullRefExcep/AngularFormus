var app = angular.module('app', [
    'formus',
]);
app.constant('FORMS_CONFIG', formsConfiguration);
/** Set source of forms configuration */
app.config(['FormusContainerProvider', 'FORMS_CONFIG', function (FormusContainerProvider, FORMS_CONFIG) {
    FormusContainerProvider.setContainer(FORMS_CONFIG);
}]);

app.controller('MainCtrl',function ($scope, FormusContainer) {
	$scope.form = FormusContainer.get('firstForm');
})