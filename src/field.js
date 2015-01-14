formus.directive('formusField', function($injector, $http, $compile, $log, $templateCache, FormusLinker, FormusValidator, FormusHelper) {
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            'config': '='
        },
        link: function($scope, $element, $attr) {
            $scope.isValid = true;
            $scope.dirty = false;
            $scope.validation = function(value) {
                if (_.isObject($scope.config.validators)) {
                    $scope.errors = [];
                    angular.forEach($scope.config.validators, function(args, name) {
                        var error = FormusValidator.validate(name, value, $scope.config, args);
                        if ((error !== null) && (_.isString(error))) {
                            $scope.errors.push(error);
                        }
                    });
                }
            };

            $scope.$on('Formus.validate', function() {
                if (!$scope.config.hide) {
                    $scope.validation($scope.model);
                } else {
                    $scope.errors = [];
                    $scope.isValid = true;
                }
                $scope.$emit('Formus.validated', $scope.isValid);
            });

            var init = function() {
                $scope.parentCtrl = $element.parent().controller('formus-field');
                if (_.isUndefined($scope.parentCtrl)) {
                    $scope.parentCtrl = $element.parent().controller('formus-form');
                }
                $scope.parentScope = $scope.parentCtrl.getScope();

                $scope.parentScope.$watch('model', function(newValue) {
                    $scope.model = FormusHelper.getNested(newValue, $scope.config.name);
                }, true);

                $scope.$watch('model', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        FormusHelper.setNested($scope.parentScope.model, $scope.config.name, newValue);
                        $scope.dirty = true;
                        $scope.validation(newValue);
                    }
                });

                $scope.parentScope.$watch('errors', function(newValue) {
                    $scope.errors = FormusHelper.getNested(newValue, $scope.config.name);
                }, true);

                $scope.$watch('errors', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $scope.isValid = !((Array.isArray(newValue)) && (newValue.length > 0));
                        $scope.parentScope.errors = FormusHelper.setNested($scope.parentScope.errors, $scope.config.name, newValue);
                    }
                });

                $scope.isParent = (!_.isUndefined($scope.config.fields));
                /** Set field type 'fieldset' when it has child fields and don't set other type */
                if ($scope.isParent && (_.isUndefined($scope.config.input))) {
                    $scope.config.input = 'fieldset';
                }

                FormusLinker.call($scope.config.input, {
                    $scope: $scope,
                    $element: $element,
                    $attr: $attr
                });
                if (_.isFunction($scope.config.linker)) {
                    $injector.invoke($scope.config.linker, this, {
                        $scope: $scope,
                        $element: $element,
                        $attr: $attr
                    });
                }
            };

            /** Wait when config will be defined */
            var listener = $scope.$watch('config', function() {
                if (angular.isDefined($scope.config)) {
                    init();
                    listener();
                }
            }, true);
        },
        controller: function($scope, $element) {
            this.getScope = function() {
                return $scope;
            };
        }
    };
});
