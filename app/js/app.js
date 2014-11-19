var app = angular.module('app', [
    'formus',
]);

app.constant('FORMS_CONFIG', formsConfiguration);

/** Set source of forms configuration */
app.config(['FormusContainerProvider', 'FORMS_CONFIG', function(FormusContainerProvider, FORMS_CONFIG) {
    FormusContainerProvider.setContainer(FORMS_CONFIG);
}]);

app.controller('MainCtrl', function($scope, FormusContainer, FormusHelper, FORMS_CONFIG) {
    var form = $scope.form = FormusContainer.get('firstForm');
    $scope.src = FORMS_CONFIG.firstForm;
    FormusHelper.setConfigByName(form,'newField.btn','handler', function() {
        var config = angular.copy(form.data.newField);
        form.fieldset.fields.push(config);
    });
    form.config.buttons[0].handler = function() {
        form.fieldset.fields[0].label = 'Test';
    };
    form.config.buttons[1].handler = function() {
        form.errors = {
            "type": {
                "category": {
                    "name": ["Test error"]
                }
            }
        };
    };
    form.config.buttons[2].handler = function() {
        form.data.type.category.name = 'Test';
    };
});

app.config(['FormusValidatorProvider', function(FormusValidatorProvider) {
    FormusValidatorProvider.set('match', function(value, config, arg) {
        var re;
        if (typeof(arg) === 'string') {
            re = new RegExp(arg);
        }
        if (arg instanceof RegExp) {
            re = arg;
        }
        if (!re.test(value)) {
            return config.label + ' is invalid';
        }
        return null;
    });
}]);
