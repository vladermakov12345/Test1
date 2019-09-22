module.exports = function (app) {
    var airlineReviewDetailPageController = function ($scope, $rootScope, $state, $stateParams) {
        require("./airlineReviewDetailPage.less");
        var vm = this;
         
        vm.expanded = true;
        vm.init = init;
        vm.disable=true;
        vm.inspiration_boxes = [];
        vm.photos = [];
        vm.airline = $stateParams.airline ? $stateParams.airline : "";
        vm.goToReview = goToReview;
        vm.getSearchValue = getSearchValue;
        vm.goToMainPage = goToMainPage; 
        vm.image_virginAmerica = require("../../../../resources/img/airlineReview/virginAmericaImg.png");
        vm.image_jetBlue = require("../../../../resources/img/airlineReview/jetBlueImg.png");
        vm.delta = require("../../../../resources/img/airlineReview/deltaImg.png");
        vm.image_virginAmerica_logo = require("../../../../resources/img/airlineReview/virginAmericaImg_logo.png");
        vm.virgin_logo = require("../../../../resources/img/airlineReview/virgin_logo.jpg");
        vm.init();

        function init() {

            vm.photos = [
                { "Id": "0", "ImgUrl": vm.delta, "alt": "delta" },
                { "Id": "1", "ImgUrl": vm.image_virginAmerica, "alt": "image_virginAmerica" },
                { "Id": "2", "ImgUrl": vm.image_jetBlue, "alt": "image_jetBlue" },
                { "Id": "3", "ImgUrl": vm.image_virginAmerica, "alt": "image_virginAmerica" },
                { "Id": "4", "ImgUrl": vm.delta, "alt": "delta" },
                { "Id": "5", "ImgUrl": vm.image_virginAmerica, "alt": "image_virginAmerica" },
                // { "Id": "5", "ImgUrl": vm.image_jetBlue, "alt": "image_jetBlue" }
            ];
            vm.inspiration_boxes = [{ "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "e022973d-759e-4526-a053-e6083d11a6d4", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Chicago", "City": { "Id": "d6adda44-00ab-4a20-b6df-1dfc38f52b2c", "Name": "Chicago", "Region": "Midwest", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "\u003cp\u003eLegend has it that Chicago is known as the windy city not because of the cold gusts whipping off Lake Michigan in the winter, but because of its tradition of hot air bellowing from its politicians.\u0026nbsp; This legend fits the city\u0026rsquo;s lively atmosphere, as it seems there is always something to do here, from its world-class museums to \u003ca href=\"http://accessiblego.com/tripPlanner/Chicago/Attractions/Restaurants_and_Bars\" target=\"_blank\" rel=\"noopener noreferrer\"\u003eshopping \u003c/a\u003eto ubiquitous music and comedy clubs.\u0026nbsp; The vibe of excitement here was recently pushed up a notch when the Cubs won their first World Series since 1908.\u003c/p\u003e", "IntroImage": { "Id": "7fef9204-cd69-484d-80bc-156f284c2a0d", "OriginalFileName": "Chicago-attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482449643490)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null }];


            vm.inspiration_boxes_bottom = [{ "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "e022973d-759e-4526-a053-e6083d11a6d4", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Chicago", "City": { "Id": "d6adda44-00ab-4a20-b6df-1dfc38f52b2c", "Name": "Chicago", "Region": "Midwest", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "\u003cp\u003eLegend has it that Chicago is known as the windy city not because of the cold gusts whipping off Lake Michigan in the winter, but because of its tradition of hot air bellowing from its politicians.\u0026nbsp; This legend fits the city\u0026rsquo;s lively atmosphere, as it seems there is always something to do here, from its world-class museums to \u003ca href=\"http://accessiblego.com/tripPlanner/Chicago/Attractions/Restaurants_and_Bars\" target=\"_blank\" rel=\"noopener noreferrer\"\u003eshopping \u003c/a\u003eto ubiquitous music and comedy clubs.\u0026nbsp; The vibe of excitement here was recently pushed up a notch when the Cubs won their first World Series since 1908.\u003c/p\u003e", "IntroImage": { "Id": "7fef9204-cd69-484d-80bc-156f284c2a0d", "OriginalFileName": "Chicago-attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482449643490)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null },
            { "Id": "f211bb68-6b18-4de6-8d77-fefb6486aa0f", "IsActive": true, "Type": { "Flag": "a", "Name": "Attraction" }, "Title": "Top 10 Accessible Attractions in Atlanta", "City": { "Id": "1ab5b52f-3f20-40f2-82f4-479a976bc118", "Name": "Atlanta", "Region": "Southeast", "IsActive": false }, "Author": null, "Published": "\/Date(-62135596800000)\/", "IntroText": "As the birthplace of the Civil Rights movement, home of the \u0026ldquo;Real Thing\u0026rdquo; and with a \u003ca title=\"Atlanta\" href=\"http://accessiblego.com/tripPlanner/Atlanta/Attractions/Museums_and_Galleries\" target=\"_blank\" rel=\"noopener noreferrer\"\u003ewheelchair-accessible\u003c/a\u003e transportation system, Atlanta is a great place to visit. Many of the main attractions are located close to each other, so you can easily shuttle between them.", "IntroImage": { "Id": "481f1eb6-ddba-491d-8196-c510f204c979", "OriginalFileName": "Atlanta_attractions_intro.jpg", "Type": { "Flag": "i", "Name": "image" }, "Extension": ".jpg", "Caption": null, "Credit": null, "Created": "\/Date(1482099749273)\/" }, "homepageSeq": 0, "ArticleEntries": null, "SelectedTypeId": 0, "ArticleTypes": null }
            ];

        }


        function goToReview() {
            $state.go('review');
        }

      
        function getSearchValue() {
            
            var searchText = document.getElementById('searchBox').value;
            if (searchText != "") {
                // document.getElementById('disableIcon').disabled = false;
                vm.disable=false;
            }
            else {
                // document.getElementById('disableIcon').disabled = true;
                vm.disable=true;
            }

        }
        
        function goToMainPage(){
        
            if(vm.disable == false){
                $state.go('airline_reviews_main');
            }
            else{
            return false;
            }
         
        }
    };

    airlineReviewDetailPageController.$inject = ['$scope', '$rootScope', '$state', '$stateParams'];
    app.controller('airlineReviewDetailPageController', airlineReviewDetailPageController);
};
