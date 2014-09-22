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
