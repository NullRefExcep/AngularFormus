formus.directive('formusWrapper', function(FormusTemplates, FormusLinker, $timeout) {
    return {
        restrict: 'AE',
        transclude: true,
        templateUrl: FormusTemplates.getUrl('wrapper'),
        link: {
            post: function($scope, $element, $attr) {
                $scope.input = $scope.$$childHead.$$childHead;
            }
        }
    };
});
