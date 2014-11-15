# AngularFormus
[![Bower version](https://img.shields.io/badge/bower-v0.0.2-brightgreen.svg)](https://github.com/NullRefExcep/AngularFormus/releases)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://tldrlegal.com/license/mit-license)

Customizable and extensible forms generator for AngularJS. License under MIT License.
## Usage
Form directive render form by configuration:
```html
<formus-form name="form.name" 
    model="form.data" 
    fieldsets="form.fieldsets" 
    config="form.config">
</formus-form>
```
### Install
```
$ bower install -S angular-formus
```
Add a `<script>` to your `index.html`:
```html
<script src="/bower_components/angular-formus/dist/formus.min.js"></script>
```
and add Formus module as dependency to Your application:
```js
angular.module('app', ['formus']);
```

### Form configuration

Example:
```js
form = {
    name: "systemParametersForm",
    fieldsets: {
        fields: [{
            "name": "movePayments",
            "label": "Move Payments Straight To Cash",
            "input": "checkbox"
        }, {
            "name": "cancelPendingAfter",
            "label": "Automatically Cancel Pending Mode Bookings after",
            "input": "textbox",
            "suffix": "days"
        }]
    },
    config: {
        class: 'some-css-class',
        submit: {
            title: 'Save',
            handler: function() {
                console.log('I\'m submitted');
            }
        }
    }
}
```
### Field configuration
Form must has one general field, which contain others fields.
Example of field declaration:
```js
{
  name:'nameOfFieldInModel', // string
  label: 'label', // string
  fields: [] //array of objects
  input:'typeOfInput' // string 
}
```
Fields can contain nested fields.
All field attributes are optional except `input`.
If attribute `name` isn't set, that field must contain nested fields (attribute `fields`).
You can add custom attributes, they are available in view at object config.
Linker can be overriden. E.g:
```js
{
  name:'name',
  linker:function($scope, $element, $attr, $http /**Some other services**){}
}
```

### Available inputs 
- fieldset (container for other fields)
- textbox
- texarea
- select
- checkbox 

### Customization

Formus supports customization of all module elements.

#### Templates

To change input template just register it in `FormusTemplatesProvider`:
```js
app.config(['FormusTemplatesProvider', function (FormusTemplatesProvider) {
  FormusTemplatesProvider.setTemplateUrl('color', 'views/formus/inputs/color.html');
  FormusTemplatesProvider.setTemplateUrl('group', 'views/formus/inputs/group.html');
  FormusTemplatesProvider.setTemplateUrl('file', 'views/formus/inputs/file.html');
  FormusTemplatesProvider.setTemplateUrl('gallery', 'views/formus/inputs/gallery.html');
}]);
```

#### Validation
Formus supports data validation. Validators can be attached to every field.
```js
{
  name: 'title',
  input: 'textbox',
  validators: {
    required: true /** Key - validator name, Value - options **/
  }
}
``` 
Available validators is contained in `FormusValidator` service.
Example of adding custom validator:
```js
app.config(['FormusValidatorProvider', function (FormusValidatorProvider) {
  FormusValidatorProvider.set('numeric', function (value, config, arg) {
    if (value) {
      if (!tools.validateNumerical(value)) {
        return config.label + ' must be numerical';
      }
      if (typeof(arg) === 'object') {
        if ((angular.isDefined(arg.min)) && (value < arg.min)) {
          return config.label + ' must be > ' + arg.min;
        }
      }
    }
    return null;
  });
}]);
```
Validator function can take three parameters:
- field value
- field config
- validator options

This validator can take options as object with property `min`, e.g:
```js
validators: {numeric: {min:0}}
```

##### Events
Formus emit an event after validation:
```js
$rootScope.$on('Formus.validatedForm', function(event, name, isValid) {
  /*Some stuff*/
});
``` 
To validate form without submit:
```js
$rootScope.$broadcast('Formus.validateForm', 'myFormName');
```

#### Display back-end errors
For showing errors that return from server you can use attribute `errors` in `formus-form` directive.
Errors must be object with properties named as form fields and errors it's array of strings, e.g: 
```js
{
  name:['Name must be longer']
}
```
`FormusHelper` has special method for extracting errors from response.
Example of setting errors:
```js
form.config.submit.handler = function() {
  return save().then(function() {
     $state.go('^.list');
  }).catch(function(response) {
    form.errors = FormusHelper.extractBackendErrors(response);
  });
};
```

All methods of `FormusHelper` can be overridden, e.g:
```js
app.config(['FormusHelperProvider', function(FormusHelperProvider) {
    FormusHelperProvider.setMethod('nameOfMethod', function() {
        /* Implementation */
    });
}]);
```


#### Default Configurations

`FormusConfig` service allows to set default configurations for every type of input.
Setter take two params:
- name of filed
- callback which must return config object

```js
app.config(['FormusConfigProvider', function (FormusConfigProvider) {
  FormusConfigProvider.set('datetime', function () {
    return {
      minView: 0,
      startView: 0,
      dataType: 'number',
      dateFormat: 'shortDate'
    }
  });
}]);
```

### Features

#### Nested fields:

You can create form with nested fields:
```js
form = {
    fieldsets: {
        fields: [
            {"name": "val0", "label": "Text Value", "input": "checkbox"},
            {"name": "someExtend", "fields": [
                    {"name": "val1", "label": "Nested Value #1", "input": "textbox"},
                    {"name": "val2", "label": "Nested Value #2", "input": "select","items":  [
                            {"value":1, "title":"opt 1"},
                            {"value":2, "title":"opt 2"}
                        ]
                    },
                ]
            }
        ]
    }
};
```
As result get model:
```js
{
    val0: true,
    someExtend:{
        val1: 'some text',
        val2: 2
    }
}

```
You can use dot notation:
```js
form = {
    fieldsets: {
        fields: [
            {"name": "base.first", "label": "Some Value", "input": "textbox"},
            {"name": "base.second", "label": "Some Value#2", "input": "textbox"},
            {"name": "other.value", "label": "Some Value#3", "input": "checkbox"},
        ]
    }
};
```
Result model:
```js
{
    base:{
        first: 'text val',
        first: 'text val2',
    },
    other:{
        value: false
    }
}
```

#### Forms Container

For comfortable work with large number of forms you can use `FormusContainer`.
This service provide global storage for form configs.
Configuration:
```js
var formsConfiguration = {form1:{/**...**/}, form2:{/**...**/}};
app.constant('FORMS_CONFIG', formsConfiguration);

app.config(['FormusContainerProvider', 'FORMS_CONFIG', function (FormusContainerProvider, FORMS_CONFIG) {
  FormusContainerProvider.setContainer(FORMS_CONFIG);
}]);
```
After configuration you can use `FormusContainer` in controller:
```js
var myCtrl = function($scope, FormusContainer){
    $scope.form = FormusContainer.get('form1');
}
```
Default configuration of form can be set using `FormusConfig`.
```js
app.config(['FormusConfigProvider', function (FormusConfigProvider) {
  FormusConfigProvider.set('form', function () {
    return {
        name: 'default-name',
        fieldset: { fields: [] },
        data: {},
        config: {
            buttons: [],
            submit: { title: 'Save', handler: function() {} }
        }
    }
  });
}]);
```
To extend a form configuration you can specify attribute `parent`. Formus will search container for form with that name and use its configuration.
```js
{
    //form containter
    parent: {
        config:{
            submit:{title:'Find'}
        }
    },
    child: {
        parent:'parent'
    }
}
```

#### Linkers

You can set custom linkers for special input types:
```js
app.config(['FormusLinkerProvider', function (FormusLinkerProvider) {
    FormusLinkerProvider.setLinker('gallery', function ($scope, $element, fileUpload) {
        $scope.uploadImage = function () {
          if (fileUpload.isValid($element.find('.imgFileInput'))) {
            alert('Select file');
          } else {
            fileUpload.upload($element.find('.imgFileInput')).then(function (response) {
              $scope.model.push(response.data.url);
            });
          }
        };
        $scope.removeImage = function (index) {
          $scope.model.splice(index, 1);
        };
        $scope.afterLoadTemplate = function () {
          if (!Array.isArray($scope.model)) {
            $scope.model = [];
          }
        }
    });
}]);
```

