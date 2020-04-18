// define a module which returns an Object (not a class)

define(function(){
    // variables are private due to closure and only accessible via the functions in the returned object.
    var _name = 'Demo';

    // essentially the public API
    return {
        getName: function() {
            return _name;
        }
    };

});