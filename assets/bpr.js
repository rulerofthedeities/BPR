var app = angular.module("bpApp", []);
app.controller("formController", function(){
    this.bpr = {};
    this.submitBpr = function(bpr){
        console.log(this.bpr);
        this.bpr = {};
    };
});