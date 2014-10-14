formus.directive('formusWrapper', function(FormusTemplates, FormusLinker, $timeout) {
    return {
        restrict: 'AE',
        transclude: true,
        templateUrl: FormusTemplates.getUrl('wrapper'),
        link: function($scope, $element, $attr) {
            $timeout(function () {
                $scope.input = $scope.$$childHead.$$childHead;
            });
        }
    };
});
