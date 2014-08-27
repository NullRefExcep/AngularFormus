
var formsConfiguration = {
        firstForm: {
            title: "Info",
            fieldset: {
                fields: [
                    {
                        name: "id",
                        type: "text",
                        label: " ID",
                        input: "textbox",
                        readonly: true,
                        validators: {
                            required: true
                        }
                    },
                    {
                        name: "name",
                        type: "string",
                        label: "Name",
                        input: "textbox",
                        validators: {
                            required: true
                        }
                    },
                    {
                        name: "website",
                        type: "string",
                        label: "Website",
                        input: "textbox",
                        validators: {
                            required: true,
                            url: true
                        }
                    },
                    {
                        name: "address",
                        type: "string",
                        label: "Address",
                        input: "textarea",
                        validators: {
                            required: true
                        }
                    },
                    {
                        name: "phone",
                        type: "string",
                        label: "Phone",
                        input: "textbox",
                        validators: {
                            required: true,
                            phone: true
                        }
                    },
                    {
                        name: "fax",
                        type: "string",
                        label: "Fax",
                        input: "textbox",
                        validators: {
                            required: true,
                            phone: true
                        }
                    },
                    {
                        name: "currency",
                        type: "int",
                        label: "Currency",
                        input: "select",
                        items: [
                            {
                                value: 1,
                                title: "AUD"
                            }
                        ],
                        validators: {
                            required: true
                        }
                    },
                    {
                        name: "timezone",
                        type: "int",
                        label: "Timezone",
                        input: "select",
                        validators: {
                            required: true
                        },
                        items: [
                            {
                                value: 1,
                                title: "ACT"
                            },
                            {
                                value: 2,
                                title: "North"
                            },
                            {
                                value: 3,
                                title: "NSW"
                            },
                            {
                                value: 4,
                                title: "Queensland"
                            },
                            {
                                value: 5,
                                title: "South"
                            },
                            {
                                value: 6,
                                title: "Victoria"
                            },
                            {
                                value: 7,
                                title: "West"
                            }
                        ]
                    }
                ]
            }
        },
}