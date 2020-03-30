// define a module which returns an Object (not a class)

define(function(){
    // variables are private due to closure and only accessible via the functions in the returned object.
    var name = 'Demo';

    return {
        getName: function() {
            return name;
        }
    };

});