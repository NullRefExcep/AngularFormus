/** 
 * Service for validation
 *
 * This service allows to contain validator functions and perform validation of field values
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
    var getProvider = function($log, $injector) {
        function get(name) {
            if (validators[name]) {
                return validators[name];
            }
        }

        function validate(validatorName, value, config, args) {
            if (validators[validatorName]) {
                return $injector.invoke(validators[validatorName], null, {
                    value: value,
                    config: config,
                    args: args
                });
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
