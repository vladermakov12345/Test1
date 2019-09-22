var stripComments = require('strip-json-comments');

//very basic example b/c we are just using the node js strip json comments
module.exports = function(source){
    this.cacheable();   //more performant; always use unless you are doing something non-deterministic

    console.log('source',source);
    console.log('strippedSource',stripComments(source));

    return stripComments(source);
}