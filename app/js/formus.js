(function () {
/**
 * @author  Dmytro Karpovych
 */
var formus = angular.module('formus', []);

formus.provider('FormusConfig', function($logProvider) {
    var getDefault = function() {
        return {
            showErrors: true
        };
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
                    showErrors: true,
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
                showErrors: false
            };
        },
        checkbox: function() {
            return {
                showLabel: false,
                trueValue: true,
                falseValue: false,
                default: false
            }
        },
        checklist: function() {
            return {
                trueValue: true,
                falseValue: false,
                items: []
            }
        },
        radio: function() {
            return {
                inline: true
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
        button: function() {
            return {
                class: 'btn btn-primary',
                handler: function() {}
            };
        },
        file: function() {
            return {
                showLink: true
            };
        },
        message: function () {
            return {
                type: 'info'
            }
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
            // $log.info('Don\'t find config for input "' + name + '"');
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
        if (angular.isUndefined(name)) {
            log.error('Don\'t set form configuration name ');
        } else {
            if (container[name]) {
                form = container[name];
                if (!form.name) {
                    form.name = name;
                }
                if (angular.isDefined(form.parent)){
                   form = helper.extendDeep(get(form.parent), angular.copy(form));
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
        scope: {
            'config': '='
        },
        link: function($scope, $element, $attr) {
            $scope.isValid = true;
            $scope.dirty = false;
            $scope.validation = function(value) {
                if (angular.isObject($scope.config.validators)) {
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
                if (angular.isUndefined($scope.parentCtrl)) {
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

                $scope.isParent = (!angular.isUndefined($scope.config.fields));
                /** Set field type 'fieldset' when it has child fields and don't set other type */
                if ($scope.isParent && (_.isUndefined($scope.config.input))) {
                    $scope.config.input = 'fieldset';
                }

                FormusLinker.call($scope.config.input, {
                    $scope: $scope,
                    $element: $element,
                    $attr: $attr
                });
                if (angular.isFunction($scope.config.linker)) {
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

/** 
 * Service with specific functions
 */
formus.provider('FormusHelper', function() {
    var setConfigByName = function setConfigByName(self, path, prop, value) {
        if (self.fieldset) {
            self = self.fieldset;
        }
        var target = self;
        if (angular.isString(path)) {
            path = path.split('.');
        }
        path = path.length ? path : false;
        if (path) {
            if (self.name === path[0]) {
                path.shift();
            }
            if (path.length === 0) {
                setConfigByName(self, false, prop, value);
            } else {
                _.each(self.fields, function(item) {
                    setConfigByName(item, path, prop, value);
                });
            }
        } else {
            target[prop] = value;
        }
    };
    /**
     * Create error array form error object
     */
    var getErrorsList = function(object) {
        var errorList = [];
        var addErrors = function(errors) {
            if (Array.isArray(errors)) {
                if (_.each(errors, function(item) {
                        errorList.push(item);
                    }));
            } else {
                _.each(errors, function(item) {
                    addErrors(item);
                });
            }
        }
        addErrors(object);
        return errorList;
    }

    /**
     * Extract error object from server response
     */
    var extractBackendErrors = function(response) {
        var errors = {};
        _.each(response.data, function(error) {
            this[error.field] = [error.message];
        }, errors);
        return errors;
    };

    /**
     * Merge objects by recursive strategy
     */
    var extendDeep = function extendDeep(dst, src) {
        return _.merge(dst, src);
    };

    /**
     * Set property value from object by nested name (with dot)
     */
    var setNested = function(model, name, value) {
        if (name) {
            if (!angular.isObject(model)) {
                model = {};
            }
            var result = model;
            var keys = name.split('.');
            var len = keys.length;
            for (var i = 0; i < len - 1; i++) {
                var key = keys[i];
                if (!model[key]) model[key] = {}
                model = model[key];
            }
            model[keys[len - 1]] = value;
            return result;
        }
        return model = value;
    };

    /**
     * Get property value from object by nested name (with dot)
     */
    var getNested = function(model, name, defaultValue) {
        defaultValue = angular.isDefined(defaultValue) ? defaultValue : undefined;
        if (angular.isDefined(model)) {
            if (name) {
                if (angular.isObject(model)) {
                    var result = model;
                    var keys = name.split('.');
                    for (i = 0; i < keys.length; i++) {
                        result = result[keys[i]];
                        if (angular.isUndefined(result)) {
                            return defaultValue;
                        }
                    }
                    return result;
                }
                return defaultValue;
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

    var methods = {
        setConfigByName: setConfigByName,
        getErrorsList: getErrorsList,
        setNested: setNested,
        getNested: getNested,
        initModel: initModel,
        extendDeep: extendDeep,
        extractBackendErrors: extractBackendErrors,
        extractItems: extractItems
    };
    return {
        setMethod: function(name, method) {
            methods[name] = method;
        },
        $get: function() {
            return methods;
        }
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
                if (angular.isFunction($scope.afterLoadTemplate)) {
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
        if (($scope.config.label) && angular.isUndefined($scope.config.showLabel)) {
            $scope.config.showLabel = true;
        }
    };


    var formLinker = function($scope, FormusHelper) {
        var listener = $scope.$watch('fieldset', function() {
            if (!_.isUndefined($scope.fieldset)) {
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
                  // log.info('Don\'t find linker for input "' + type + '"');
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
        button: 'formus/inputs/button.html',
        label: 'formus/inputs/label.html',
        message: 'formus/inputs/message.html',
    };

    /**
     * @param name string | object (name: Url)
     * @param templateUrl
     */
    var setTemplateUrl = function(name, templateUrl) {
        if (angular.isString(name)) {
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

/** 
 * Service for validation
 */
formus.provider('FormusValidator', function($logProvider) {
    var validators = {
        required: function(value, config, args) {
            if (!value) {
                return ((args) && (args.msg)) ? args.msg : (config.label + ' cannot be blank');
            }
            return null;
        },
        email: function(value, config) {
            var validateEmail = function(value) {
                if (value) {
                    var pattern = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return pattern.test(value);
                } else {
                    return true;
                }
            }

            if (!validateEmail(value)) {
                return config.label + ' must be a valid e-mail';
            }
            return null;
        },
        url: function(value, config) {
            var validateLink = function(url) {
                if (value) {
                    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
                    return pattern.test(url);
                } else {
                    return true;
                }
            }
            if (!validateLink(value)) {
                return config.label + ' must be a valid url';
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
        if (angular.isFunction(callback)) {
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