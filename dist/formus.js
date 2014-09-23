formus.provider('FormusConfig', function($logProvider) {
    var getDefault = function() {
        return {};
    };
    var configs = {
        form: function() {
            return {
                title: '',
                name: '',
                fieldset: {
                    wrapClass: 'col-md-12',
                    fields: []
                },
                data: {},
                config: {
                    readonly: false,
                    buttons: [],
                    class: 'padding-top-10',
                    submit: {
                        title: 'Save',
                        handler: function() {}
                    }
                }
            };
        },
        fieldset: function() {
            return {
                wrapClass: 'col col-6'
            };
        },
        radio: function() {
            return {
                horizontal: false
            };
        },
        group: function() {
            return {
                'class': 'bordered'
            };
        },
        file: function() {
            return {
                showLink: true
            };
        }
    };
    var set = function(name, config) {
        if (typeof(config) !== 'function') {
            $logProvider.warn('Config must be callback');
        }
        configs[name] = config;
    };
    var getProvider = function($log) {
        var get = function(name) {
            if (configs[name]) {
                return configs[name]();
            }
            $log.info('Don\'t find config for input "' + name + '"');
            return getDefault();
        };
        return {
            get: get
        };
    };

    return {
        set: set,
        $get: ['$log', getProvider]
    };
});
;
/** 
 * Provide getter for forms configurations
 */
formus.provider('FormusContainer', function() {
    var log,
        helper,
        defaultConfig,
        container = {};
    this.setContainer = function(data) {
        container = data;
    };

    var get = function(name) {
        var form = {};
        if (typeof name === 'undefined') {
            log.error('Don\'t set form configuration name ');
        } else {
            if (container[name]) {
                form = container[name];
                if (!form.name) {
                    form.name = name;
                }
            } else {
                log.error('Form configuration with name "' + name + '" don\'t found in configuration container');
            }
        }
        return helper.extendDeep(angular.copy(defaultConfig), angular.copy(form));
    };

    var set = this.set = function(name, value) {
        container[name] = value;
    };
    this.$get = ['$log', 'FormusConfig', 'FormusHelper',
        function($log, FormusConfig, FormusHelper) {
            defaultConfig = FormusConfig.get('form');
            log = $log;
            helper = FormusHelper;
            return {
                get: get,
                set: set
            };
        }
    ];
});
;
formus.directive('formusField', function($injector, $http, $compile, $log, $templateCache, FormusLinker, FormusValidator, FormusHelper) {
    return {
        transclude: true,
        replace: true,
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
;
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
        controller: function($scope, $element) {
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
;
/**
 * @author  Dmytro Karpovych
 */
var formus = angular.module('formus', []);
;
/** 
 * Service with specific functions
 *
 */
formus.factory('FormusHelper', function() {
    var extractBackendErrors = function(response) {
        var errors = {};
        angular.forEach(response.data, function(error) {
            this[error.field] = [error.message];
        }, errors);
        return errors;
    };
    var extendDeep = function extendDeep(dst) {
        angular.forEach(arguments, function(obj) {
            if (obj !== dst) {
                angular.forEach(obj, function(value, key) {
                    if (angular.isDefined(dst[key]) && dst[key].constructor && dst[key].constructor === Object && typeof(dst[key]) === 'object' && typeof(value) === 'object') {
                        extendDeep(dst[key], value);
                    } else {
                        dst[key] = value;
                    }
                });
            }
        });
        return dst;
    };

    var setNested = function(model, name, value) {
        if (name) {
            if (!angular.isObject(model)) {
                model = {};
            }
            var keys = name.split('.');
            if (keys.length > 1) {
                return setNested(model[keys[0]], keys.splice(1, keys.length).join('.'), value);
            } else {
                model[name] = value;
                return value;
            }
        }
        model = value;
        return value;
    };
    var getNested = function(model, name, defaultValue) {
        defaultValue = angular.isDefined(defaultValue) ? defaultValue : undefined;
        if (angular.isDefined(model)) {
            if (name) {
                var keys = name.split('.');
                if (keys.length > 1) {
                    return getNested(model[keys[0]], keys.splice(1, keys.length).join('.'), defaultValue);
                } else {
                    return getNested(model[name], false, defaultValue);
                }
            }
            return model;
        }
        return defaultValue;
    };

    var initModel = function(model, field) {
        var name = field.name;
        if (name) {
            var keys = name.split('.');
            if (keys.length > 1) {
                var currentModel = model;
                _.each(keys, function(key) {
                    if (typeof(currentModel) === 'undefined') {
                        currentModel = {};
                    }
                    currentModel = currentModel[key];
                });
                if (typeof(currentModel) === 'undefined') {
                    currentModel = (typeof(field.default) === 'undefined') ? ((field.fields) ? {} : '') : field.default;
                }
            } else {
                if (typeof(model[name]) === 'undefined') {
                    model[name] = (typeof(field.default) === 'undefined') ? ((field.fields) ? {} : '') : field.default;
                }
                if (field.fields) {
                    _.each(field.fields, function(field) {
                        initModel(model[name], field);
                    });
                }
            }
        } else {
            if (typeof(model) === 'undefined') {
                model = (typeof(field.default) === 'undefined') ? ((field.fields) ? {} : '') : field.default;
            }
            if (field.fields) {
                _.each(field.fields, function(field) {
                    initModel(model, field);
                });
            }
        }
    };
    return {
        setNested: setNested,
        getNested: getNested,
        initModel: initModel,
        extendDeep: extendDeep,
        extractBackendErrors: extractBackendErrors
    };
});
;
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
;
/**
 * Provide container for templates by input types
 */
formus.provider('FormusTemplates', function() {
    var q, cache, http, log;
    var templateMap = {
        radio: 'views/formus/inputs/radio.html',
        checkbox: 'views/formus/inputs/checkbox.html',
        checklist: 'views/formus/inputs/checklist.html',
        hidden: 'views/formus/inputs/hidden.html',
        select: 'views/formus/inputs/select.html',
        textarea: 'views/formus/inputs/textarea.html',
        textbox: 'views/formus/inputs/textbox.html',
        fieldset: 'views/formus/inputs/fieldset.html',
        message: 'views/formus/inputs/message.html',
        datetime: 'views/formus/inputs/datetime.html',
        label: 'views/formus/inputs/label.html',
        ckeditor: 'views/formus/inputs/ckeditor.html'
    };

    /**
     * @param name string | object (name: Url)
     * @param templateUrl
     */
    var setTemplateUrl = function(name, templateUrl) {
        if (typeof name === 'string') {
            templateMap[name] = templateUrl;
        } else {
            angular.forEach(name, function(templateUrl, name) {
                setTemplateUrl(name, templateUrl);
            });
        }
    };

    /**
     * Check if exist template with name
     * @param name
     */
    var has = function(name) {
        return typeof(templateMap[name]) !== 'undefined';
    };

    /**
     * @param name
     * @returns string
     */
    var getTemplateUrl = function(name) {
        return templateMap[name];
    };

    /**
     * Load template by url
     * @param templateUrl
     */
    var load = function(templateUrl) {
        var deferred = q.defer();
        http.get(templateUrl, {
            cache: cache
        }).then(function(response) {
            deferred.resolve(response.data);
        }, function() {
            log.error('Problem with loading template for ' + templateUrl);
            deferred.reject();
        });
        return deferred.promise;
    };

    /**
     * Get template by name
     * @param name
     */
    var get = function(name) {
        return load(getTemplateUrl(name));
    };

    return {
        setTemplateUrl: setTemplateUrl,
        $get: ['$q', '$http', '$templateCache', '$log',
            function($q, $http, $templateCache, $log) {
                q = $q;
                http = $http;
                cache = $templateCache;
                log = $log;
                return {
                    has: has,
                    get: get,
                    load: load,
                    getTemplateUrl: getTemplateUrl
                };
            }
        ]
    };
});
;
formus.provider('FormusValidator', function($logProvider) {
    var validators = {
        required: function(value, config) {
            if (!value) {
                return config.label + ' cannot be blank';
            }
            return null;
        }
    };
    var getProvider = function($log) {
        function get(name) {
            if (validators[name]) {
                return validators[name];
            }
        }

        function validate(validatorName, value, config, args) {
            if (validators[validatorName]) {
                return validators[validatorName](value, config, args);
            }
            $log.warn('Don\'t find validator with name "' + validatorName + '"');
            return null;
        }
        return {
            get: get,
            validate: validate
        };
    };
    var set = function(name, callback) {
        if (typeof(callback) === 'function') {
            validators[name] = callback;
        } else {
            $logProvider.warn('Validator must be function. Can\'t set validator with name "' + name + '"');
        }
    };
    return {
        set: set,
        $get: getProvider
    };
});
