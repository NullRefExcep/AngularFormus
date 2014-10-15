AngularFormus
=============
[![Bower version](https://img.shields.io/badge/bower-v0.0.2-brightgreen.svg)](https://github.com/NullRefExcep/AngularFormus/releases)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://tldrlegal.com/license/mit-license)

Form generator for AngularJS
Usage:
----
```html

    <formus-form name="form.name"
                 model="form.data"
                 fieldsets="form.fieldsets"
                 config="form.config">
    </formus-form>
```
Install:
-------
```
bower install -S angular-formus

```
Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular-formus/dist/formus.min.js"></script>
```
Available inputs:
----------------
- textbox
- texarea
- select
- checkbox

You can add own input types, just register template in FormusTemplatesProvider:
```js
app.config(['FormusTemplatesProvider', function (FormusTemplatesProvider) {
  FormusTemplatesProvider.setTemplateUrl('color', 'views/formus/inputs/color.html');
  FormusTemplatesProvider.setTemplateUrl('group', 'views/formus/inputs/group.html');
  FormusTemplatesProvider.setTemplateUrl('file', 'views/formus/inputs/file.html');
  FormusTemplatesProvider.setTemplateUrl('gallery', 'views/formus/inputs/gallery.html');
}]);
```

Form configuration:
------------------
Example:
```js
form = {
        name: "systemParametersForm",
        fieldsets: {
                fields: [
                    {
                        "name": "movePayments",
                        "label": "Move Payments Straight To Cash",
                        "input": "checkbox"
                    },
                    {
                        "name": "cancelPendingAfter",
                        "label": "Automatically Cancel Pending Mode Bookings after",
                        "input": "textbox",
                        "suffix": "days"
                    }
                ]
            },
        config: {
            class: 'some-css-class',
            submit: {
                title: 'Save',
                handler: function () {
                  console.log('I\'m submited');
                }
            }
        }
      };
```
Nested fields:
-------------
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
Also You can use dot notation:
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
## License
The MIT License


