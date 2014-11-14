/** 
 * Service with specific functions
 */
formus.factory('FormusHelper', function() {
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

    return {
        getErrorsList: getErrorsList,
        setNested: setNested,
        getNested: getNested,
        initModel: initModel,
        extendDeep: extendDeep,
        extractBackendErrors: extractBackendErrors,
        extractItems: extractItems
    };
});
