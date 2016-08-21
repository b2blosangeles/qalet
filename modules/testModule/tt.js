var assert = require('assert');
describe('String#split', function(){
  it('should return an array', function(){
    assert(Array.isArray('a,b,c'.split(',')));
  });

it('--->should not return an array', function(){
    assert(Array.isArray('a,b,c'));
  });

})
