var formsConfiguration = {
    firstForm: {
        title: 'Info',
        fieldset: {
            fields: [{
                name: 'type.category',
                fields: [{
                    name: 'name',
                    label: 'Name',
                    input: 'textbox',
                    validators: {
                        required: true
                    }
                }, {
                    name: 'id',
                    label: 'ID',
                    input: 'textbox',
                    readonly: true,
                    default: 1,
                    addon: '#'
                }]
            }, {
                name: 'checkValue',
                input: 'checkbox',
                label: 'Subscribe',
                trueValue: true,
                falseVaue: false,
                default: false
            }, {
                name: 'website',
                label: 'Website',
                input: 'textbox',
                default: 'mysite.com'
            }, {
                name: 'address',
                label: 'Address',
                input: 'textarea',
                rows: 2,
                validators: {
                    required: true
                }
            }, {
                name: 'user',
                label: 'User',
                input: 'select',
                empty: 'Select ...',
                items: [{
                    value: 1,
                    title: 'User 1'
                }, {
                    value: 2,
                    title: 'User 2'
                }],
                validators: {
                    required: true
                }
            }]
        },
        config: {
            buttons: [{
                class: 'btn btn-success',
                title: 'Load List From GitHub'
            },{
                class: 'btn btn-warning',
                title: 'Set Custom Error'
            },{
                class: 'btn btn-danger',
                title: 'Clear Errors'
            },{
                class: 'btn btn-default',
                title: 'Add New Text Field'
            }],
            submit: {
                class: 'btn btn-primary'
            }
        }
    },
    secondForm: {
        fieldset: {

        }
    }
}
