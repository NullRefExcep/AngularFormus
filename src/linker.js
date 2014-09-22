/** 
 * Provide container for directives linkers
 */
formus.provider('FormusLinker', function() {
    var loadTemplateLinker = function($scope, $element, $compile, FormusTemplates, $log) {
        if ($scope.config) {
            $scope.setElementTemplate = function(templateData) {
                $element.html(templateData);
                $compile($element.contents())($scope);
                if (typeof($scope.afterLoadTemplate) === 'function') {
                    $scope.afterLoadTemplate();
                }
            };
            var template = $scope.config.template;
            if (template) {
                $scope.setElementTemplate(template);
            } else {
                var templateName = $scope.config.templateName;
                if (templateName && (FormusTemplates.has(templateName))) {
                    FormusTemplates.get(templateName).then(function(template) {
                        $scope.setElementTemplate(template);
                    }, function() {
                        $log.error('Template type \'' + templateName + '\' not supported.');
                    });
                } else {
                    var templateUrl = $scope.config.templateUrl;
                    if (templateUrl) {
                        FormusTemplates.load(templateUrl).then(function(template) {
                            $scope.setElementTemplate(template);
                        }, null);
                    } else {
                        var input = $scope.config.input;
                        if (input && (FormusTemplates.has(input))) {
                            FormusTemplates.get(input).then(function(template) {
                                $scope.setElementTemplate(template);
                            }, function() {
                                $log.error('Template type \'' + input + '\' not supported.');
                            });
                        }
                    }
                }
            }
        }
    };

    var defaultLinker = function($scope, FormusConfig) {
        var defaultConfig = FormusConfig.get($scope.config.input);
        _.each(defaultConfig, function(value, name) {
            if (angular.isUndefined($scope.config[name])) {
                $scope.config[name] = value;
            }
        });
        if (($scope.config.label) && (typeof($scope.config.showLabel) === 'undefined')) {
            $scope.config.showLabel = true;
        }
    };

    var formLinker = function($scope, FormusHelper) {
        var listener = $scope.$watch('fieldset', function() {
            if (typeof($scope.fieldset) !== 'undefined') {
                FormusHelper.initModel($scope.model, $scope.fieldset);
                $scope.errors = $scope.errors || {};
                listener();
            }
        });
    };

    var linkers = {
        loadTemplate: loadTemplateLinker,
        default: defaultLinker,
        form: formLinker
    };

    function getLinker(injector, log) {
        return {
            call: function(type, args) {
                injector.invoke(linkers.default, null, args);
                if (linkers.hasOwnProperty(type)) {
                    injector.invoke(linkers[type], null, args);
                } else {
                    log.info('Don\'t find linker for input "' + type + '"');
                }
                injector.invoke(linkers.loadTemplate, null, args);
            },
            formLinker: function(args) {
                injector.invoke(linkers.form, null, args);
            }
        };
    }

    return {
        setLinker: function(type, linker) {
            linkers[type] = linker;
        },
        $get: ["$injector", "$log",
            function($injector, $log) {
                return getLinker($injector, $log);
            }
        ]
    };
});
