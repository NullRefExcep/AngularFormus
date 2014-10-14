formus.directive('formusField', function($injector, $http, $compile, $log, $templateCache, FormusLinker, FormusValidator, FormusHelper) {
    return {
        transclude: true,
        restrict: 'E',
        require: 'ngModel',
        scope: {
            'config': '=',
            'parentErrors': '=errors',
            'ngModel': '='
        },
        link: function($scope, $element, $attr, ngModelCtrl) {
            $scope.isValid = true;
            $scope.validation = function(value) {
                if (typeof($scope.config.validators) === 'object') {
                    var errors = [];
                    angular.forEach($scope.config.validators, function(args, name) {
                        var error = FormusValidator.validate(name, value, $scope.config, args);
                        if ((error !== null) && (typeof(error) === 'string')) {
                            errors.push(error);
                        }
                    });
                    if (errors.length > 0) {
                        $scope.error = errors;
                        $scope.isValid = false;
                    } else {
                        $scope.error = null;
                        $scope.isValid = true;
                    }
                }
            };
            var initErrorsWatchers = function() {
                $scope.$watch('parentErrors', function(newValue) {
                    if (angular.isDefined(newValue)) {
                        if ($scope.isParent) {
                            $scope.errors = FormusHelper.getNested(newValue, $scope.config.name, $scope.errors);
                        } else {
                            $scope.error = FormusHelper.getNested(newValue, $scope.config.name, $scope.error);
                        }
                    }
                }, true);

                if ($scope.isParent) {
                    $scope.$watch('errors', function(newValue) {
                        if (angular.isDefined(newValue)) {
                            $scope.parentErrors = newValue;
                        }
                    }, true);
                } else {
                    $scope.$watch('error', function(newValue) {
                        if (angular.isDefined(newValue)) {
                            if ($scope.config.name) {
                                if (!angular.isObject($scope.parentErrors)) {
                                    $scope.parentErrors = {};
                                }
                                $scope.parentErrors[$scope.config.name] = newValue;
                            } else {
                                $scope.parentErrors = newValue;
                            }
                        }
                    }, true);
                }
            };
            $scope.$on('Formus.validate', function() {
                if (!$scope.config.hide) {
                    $scope.validation($scope.model);
                } else {
                    $scope.error = null;
                    $scope.isValid = true;
                }
                $scope.$emit('Formus.validated', $scope.isValid);
            });

            $scope.init = function() {
                $scope.isParent = (typeof($scope.config.fields) !== 'undefined');
                /** Set field type 'fieldset' when it has child fields and don't set other type */
                if ($scope.isParent && (typeof($scope.config.input) === 'undefined')) {
                    $scope.config.input = 'fieldset';
                }
                $scope.$watch('ngModel', function(newValue) {
                    var value;
                    if (angular.isDefined(newValue) && (angular.isDefined(value = FormusHelper.getNested(newValue, $scope.config.name)))) {
                        $scope.model = value;
                    }
                }, true);
                $scope.$watch('model', function(newValue) {
                    if (angular.isDefined(ngModelCtrl.$modelValue)) {
                        var value = FormusHelper.getNested(ngModelCtrl.$modelValue, $scope.config.name);
                        if (angular.isDefined(value)) {
                            if (value !== newValue) {
                                FormusHelper.setNested(ngModelCtrl.$modelValue, $scope.config.name, newValue);
                                ngModelCtrl.$dirty = true;
                            }
                        }
                        if (ngModelCtrl.$dirty) {
                            $scope.validation(newValue);
                        }
                    }
                }, true);
                initErrorsWatchers();


                FormusLinker.call($scope.config.input, {
                    $scope: $scope,
                    $element: $element,
                    $attr: $attr,
                    $ngModelCtrl: ngModelCtrl
                });
                if (typeof($scope.config.linker) === 'function') {
                    $injector.invoke($scope.config.linker, this, {
                        $scope: $scope,
                        $element: $element,
                        $attr: $attr,
                        $ngModelCtrl: ngModelCtrl
                    });
                }
                $scope.$watch('config.hide', function(newVal) {
                    if (newVal) {
                        $element.hide();
                    } else {
                        $element.show();
                    }
                });
            };
            /** Wait when config will be defined */
            var listener = $scope.$watch('config', function() {
                if (angular.isDefined($scope.config)) {
                    $scope.init();
                    listener();
                }
            }, true);
        },
        controller: function($scope, $element) {}
    };
});
