formus.directive('formusWrapper', function(FormusTemplates, FormusLinker, $timeout) {
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope:true,
        templateUrl: FormusTemplates.getUrl('wrapper'),
        link: function($scope, $element, $attr) {
        },
        controller: function($scope, $element) {}
    };
});
