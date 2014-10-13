formus.directive('formusForm', function($q, FormusLinker) {
    return {
        transclude: true,
        replace: true,
        restrict: 'E',
        scope: {
            'name': '@',
            'fieldset': '=',
            'errors': '=?',
            'model': '=',
            'config': '='
        },
        templateUrl: 'views/formus/form.html',
        link: function($scope, $element, $attr) {
            FormusLinker.formLinker({
                $scope: $scope,
                $element: $element,
                $attr: $attr
            });
        },
        controller: function($scope, $element, $rootScope) {
            $scope.validate = function() {
                var deferred = $q.defer(),
                    fieldsAmount = $element.find('formus-field').length,
                    validated = 0,
                    hasInvalid = false;
                var handler = function(event, isValid) {
                    validated++;
                    hasInvalid = !isValid ? true : hasInvalid;
                    if (validated === fieldsAmount) {
                        if (hasInvalid) {
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    }
                };

                $scope.$on('Formus.validated', handler);
                $scope.$broadcast('Formus.validate');
                return deferred.promise;
            };
            $scope.submit = function() {
                $scope.validate().then(function() {
                    if (typeof($scope.config.submit.handler) === 'function') {
                        $scope.config.submit.handler();
                    }
                }, angular.noop);
            };

            $rootScope.$on('Formus.validateForm', function(event, name) {
                if (name === $scope.name) {
                    $scope.validate().then(function() {
                        $rootScope.$emit('Formus.validatedForm', true);
                    }, function() {
                        $rootScope.$emit('Formus.validatedForm', false);
                    });
                }
            });
        }
    };
});
