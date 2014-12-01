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
                    label: ' ID',
                    input: 'textbox',
                    readonly: true,
                    default: 1,
                    addon: '#'
                }]
            }, {
                name: 'checkValue',
                input: 'checkbox',
                label: 'Check Box'
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
                name: 'currency',
                label: 'Currency',
                input: 'select',
                empty: 'Select ...',
                items: [{
                    value: 'aud',
                    title: 'AUD'
                }, {
                    value: 'eur',
                    title: 'EUR'
                }, {
                    value: 'usa',
                    title: 'USA'
                }],
                validators: {
                    required: true
                }
            }, {
                name: 'radio',
                label: 'Radio',
                input: 'radio',
                inline: true,
                items: [{
                    value: true,
                    title: 'Yes'
                }, {
                    value: false,
                    title: 'No'
                }],
                default: true
            }, {
                label: 'New field',
                class: 'table-bordered padding-10',
                name: 'newField',
                fields: [{
                    label: 'Input type:',
                    input: 'select',
                    name: 'input',
                    items: [{
                        value: 'textbox',
                        title: 'Textbox'
                    }, {
                        value: 'select',
                        title: 'Select'
                    }, {
                        value: 'textarea',
                        title: 'Textarea'
                    }],
                    default: 'textbox'
                }, {
                    name: 'name',
                    label: 'Name',
                    input: 'textbox',
                    default: 'NewField'
                }, {
                    name: 'btn',
                    title: 'Add',
                    input: 'button'
                }]
            }]
        },
        config: {
            buttons: [{
                class: 'btn btn-danger',
                title: 'Cancel',
                validate: true
            }, {
                class: 'btn btn-warning',
                title: 'Set Erros'
            }, {
                class: 'btn btn-success',
                title: 'Set Field'
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
