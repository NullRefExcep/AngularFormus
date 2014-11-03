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
