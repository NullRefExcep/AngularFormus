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
