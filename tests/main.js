describe('pomerfest', function(){
    var $scope;

    beforeEach(module('pomerfest'));

    describe('HomeController', function(){


        beforeEach(inject(function($root, $controller){
            $scope = $rootScope.$new();
            $controller('HomeController', {$scope, $scope});
        })
    });

        it('deve possuir uma função load()', function() {
            expect()
        })
})
