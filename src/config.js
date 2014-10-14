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
