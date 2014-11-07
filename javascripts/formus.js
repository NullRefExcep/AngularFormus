(function () {
/**
 * @author  Dmytro Karpovych
 */
var formus = angular.module('formus', []);

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
                    fields: []
                },
                data: {},
                config: {
                    readonly: false,
                    buttons: [],
                    class: 'padding-top-10',
                    submit: {
                        class: 'btn btn-default',
                        title: 'Save',
                        handler: function() {}
                    }
                }
            };
        },
        fieldset: function() {
            return {
            };
        },
        checkbox: function() {
            return {
                showLabel: false,
                trueValue: true,
                falseValue: false
            }
        },
        radio: function() {
            return {
                inline:true
            }
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

formus.directive('formusForm', function($q, FormusLinker, FormusTemplates) {
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

/** 
 * Service with specific functions
 *
 */
formus.factory('FormusHelper', function() {
    /**
     * Extract error object from server response
     */
    var extractBackendErrors = function(response) {
        var errors = {};
        angular.forEach(response.data, function(error) {
            this[error.field] = [error.message];
        }, errors);
        return errors;
    };

    /**
     * Merge objects by recursive strategy
     */
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

    /**
     * Set property value from object by nested name (with dot)
     */
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

    /**
     * Get property value from object by nested name (with dot)
     */
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

    /**
     * Init model object by fields configuration with setting default values
     */
    var initModel = function(model, field) {
        var name = field.name;
        if (name) {
            var currentModel = model;
            var keys = name.split('.');
            if (keys.length > 1) {
                for (var i = 0; i < keys.length - 1; i++) {
                    var key = keys[i];
                    if (angular.isUndefined(currentModel[key])) {
                        currentModel[key] = {};
                    }
                    currentModel = currentModel[key];
                }
                name = keys[keys.length - 1];
            }
            if (angular.isUndefined(currentModel[name])) {
                currentModel[name] = (field.fields) ? {} : '';
            }
            if (angular.isDefined(field.default)) {
                currentModel[name] = field.default;
            }
            if (field.fields) {
                _.each(field.fields, function(field) {
                    currentModel[name] = initModel(currentModel[name], field);
                });
            }
        } else {
            if (angular.isUndefined(model)) {
                model = (field.fields) ? {} : '';
            }
            if (angular.isDefined(field.default)) {
                model = field.default;
            }
            if (field.fields) {
                _.each(field.fields, function(field) {
                    model = initModel(model, field);
                });
            }
        }
        return model;
    };

    /**
     * Create array of objects from other object by value and title fields and property name (optionaly)
     */
    var extractItems = function(data, valueField, titleField, groupName) {
        var list = [];

        if ((arguments.length === 4) && (angular.isDefined(groupName))) {
            data = data[groupName];
        }
        _.each(data, function(item) {
            list.push({
                value: item[valueField],
                title: item[titleField]
            });
        });
        return list;
    };

    return {
        setNested: setNested,
        getNested: getNested,
        initModel: initModel,
        extendDeep: extendDeep,
        extractBackendErrors: extractBackendErrors,
        extractItems: extractItems
    };
});

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
                $scope.model = FormusHelper.initModel($scope.model, $scope.fieldset);
                $scope.errors = $scope.errors || {};
                listener();
            }
        });
    };

    var linkers = {
        loadTemplate: loadTemplateLinker,
        default: defaultLinker,
        form: formLinker,
        wrapperLinker: loadTemplateLinker
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

/**
 * Provide container for templates by input types
 */
formus.provider('FormusTemplates', function() {
    var q, cache, http, log;
    var templateMap = {
        form: 'formus/form.html',
        wrapper: 'formus/inputs/wrapper.html',
        radio: 'formus/inputs/radio.html',
        checkbox: 'formus/inputs/checkbox.html',
        checklist: 'formus/inputs/checklist.html',
        hidden: 'formus/inputs/hidden.html',
        select: 'formus/inputs/select.html',
        textarea: 'formus/inputs/textarea.html',
        textbox: 'formus/inputs/textbox.html',
        fieldset: 'formus/inputs/fieldset.html',
        message: 'formus/inputs/message.html',
        label: 'formus/inputs/label.html',
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
                    getUrl: getTemplateUrl
                };
            }
        ]
    };
});

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
})();
angular.module("formus").run(["$templateCache", function($templateCache) {$templateCache.put("formus/form.html","<form role=form id={{name}} class={{config.class}} style={{config.style}} ng-submit=submit()><header><div ng-if=config.showErrors></div></header><formus-field ng-model=model errors=errors config=fieldset></formus-field><footer><div ng-repeat=\"btn in config.buttons\" class=pull-left><button class={{btn.class}} type=button ng-if=!btn.items ng-click=btn.handler()>{{btn.title}}</button><div class=\"btn-group margin-left-5\" ng-if=btn.items><button class=\"{{btn.class}} dropdown-toggle\" type=button data-toggle=dropdown>{{btn.title}} <span class=caret></span></button><ul class=dropdown-menu><li ng-repeat=\"item in btn.items\"><a ng-click=item.handler()>{{item.title}}</a></li></ul></div></div><button ng-if=config.submit type=submit class={{config.submit.class}} ng-bind=config.submit.title></button></footer></form>");
$templateCache.put("formus/inputs/checkbox.html","<div class=checkbox><label><input type=checkbox ng-true-value={{config.trueValue}} ng-false-value={{config.falseValue}} ng-model=model name={{config.name}}>{{config.label}}</label></div>");
$templateCache.put("formus/inputs/fieldset.html","<div class=row><formus-wrapper ng-repeat=\"field in config.fields\" class={{config.wrapClass}}><formus-field ng-model=model errors=errors config=field></formus-field></formus-wrapper></div>");
$templateCache.put("formus/inputs/radio.html","<div ng-if=!config.inline><div class=radio ng-repeat=\"item in config.items\"><label><input ng-value=item.value name={{name}} type=radio ng-model=$parent.model>{{item.title}}</label></div></div><div ng-if=config.inline><label class=\"radio radio-inline\" ng-repeat=\"item in config.items\"><input ng-value=item.value name={{name}} type=radio ng-model=$parent.model>{{item.title}}</label></div>");
$templateCache.put("formus/inputs/select.html","<select name={{config.name}} ng-model=model class=form-control style={{config.style}} id={{config.name}} ng-options=\"item.value as item.title for item in config.items\"><option value ng-if=config.empty>{{config.empty}}</option></select>");
$templateCache.put("formus/inputs/textarea.html","<textarea ng-readonly=config.readonly class=form-control placeholder={{config.placeholder?config.placeholder:config.label}} rows={{config.rows}} ng-model=model name={{config.name}} id={{config.name}} style={{config.style}}></textarea>");
$templateCache.put("formus/inputs/textbox.html","<div ng-class=\"{\'input-group\': config.addon}\"><div class=input-group-addon ng-if=config.addon ng-bind=config.addon></div><input ng-readonly=config.readonly ng-model=model class=form-control id={{config.name}} name={{config.name}} placeholder={{config.placeholder?config.placeholder:config.label}}></div>");
$templateCache.put("formus/inputs/wrapper.html","<div class=\"form-group margin-bottom-5 col-md-12\" ng-class=\"{\'has-error\': input.error}\"><label for={{input.config.name}} ng-show=input.config.showLabel ng-bind=input.config.label></label><div ng-transclude></div><span class=help-block ng-repeat=\"e in input.error\" ng-bind=e></span></div>");}]);