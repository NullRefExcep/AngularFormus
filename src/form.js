formus.directive('formusForm', function($q, FormusLinker, FormusTemplates, FormusHelper) {
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
        templateUrl: FormusTemplates.getUrl('form'),
        link: function($scope, $element, $attr) {
            $scope.isValid = true;
            $scope.errorList = [];

            $scope.$watch('errors', function(newValue) {
                $scope.errorList = FormusHelper.getErrorsList(newValue);
                $scope.isValid = $scope.errorList.length === 0;
            }, true);
            FormusLinker.formLinker({
                $scope: $scope,
                $element: $element,
                $attr: $attr
            });
        },
        controller: function($scope, $element, $rootScope) {

            $scope.callHandler = function(item) {
                if (item.validate) {
                    $scope.validate().then(function() {
                        if (angular.isFunction(item.handler())) {
                            item.handler();
                        }
                    }, angular.noop);
                } else {
                    if (angular.isFunction(item.handler())) {
                        item.handler();
                    }
                }
            }
            this.getScope = function() {
                return $scope;
            };

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
                    if (angular.isFunction($scope.config.submit.handler)) {
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
