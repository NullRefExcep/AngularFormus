/** 
 * Service for validation
 */
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
