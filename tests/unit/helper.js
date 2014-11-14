describe('Formus Helper', function() {
    var helper;
    var fieldsConfig = {
        fields: [{
            name: 'name'
        }, {
            name: 'coordinates',
            fields: [{
                name: 'lat',
                default: 10.00
            }, {
                name: 'long',
                default: 30.00
            }]
        }, {
            name: 'other.desc',
            default: 'Empty'
        }]
    };

    beforeEach(module('formus'));

    beforeEach(inject(function(FormusHelper) {
        helper = FormusHelper;
    }));

    it('should get nested property', function() {
        var value = 145;
        var obj = {
            a: {
                b: value
            }
        };
        expect(helper.getNested(obj, 'a.b')).toBe(value);
    });

    it('should set nested property', function() {
        var value = 'test value';
        var obj = {
            a: {
                b: 'old value'
            }
        };
        var setValue = helper.setNested(obj, 'a.b', value);
        expect(obj.a.b).toBe(value);
        expect(setValue).toBe(obj);
    });

    it('should create new model from fields configuration', function() {
        var value = 'test';
        var model = {
            name: value
        };
        var newModel = helper.initModel(model, fieldsConfig);
        expect(newModel.name).toBe(value);
        expect(newModel.coordinates).toBeDefined();
        expect(newModel.other.desc).toBeDefined();
        expect(newModel.other.desc).toBe('Empty');
    });
});
