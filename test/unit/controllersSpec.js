'use strict';

/* jasmine specs for controllers go here */
describe('jzacsh.MainPageCtrl', function(){
  var MainPageCtrl1;
  var mockScope;
  var EXPECTED_SUBPAGES = 2;

  beforeEach(function(){
    mockScope = {};
    MainPageCtrl1 = new jzacsh.MainPageCtrl(mockScope);
  });

  it('should create ' + EXPECTED_SUBPAGES + ' sub pages', function() {
    expect(mockScope.subpages.length).toBe(EXPECTED_SUBPAGES);
  });
});


// Boilerplate:

//describe('MyCtrl2', function(){
//  var myCtrl2;


//  beforeEach(function(){
//    myCtrl2 = new MyCtrl2();
//  });


//  it('should ....', function() {
//    //spec body
//  });
//});
