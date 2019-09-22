module.exports = function(app){
    require('./reviewController.js')(app);
};
// $('#carousel125').carousel({ interval: false });
    
//            $(".carousel2").click(function(){
//                debugger;
//              var tt =  $(this).hasClass("active")
//              if(tt == true){
//                 $(this).removeClass("active")
//              }else{
//                 $(".carousel2").removeClass("active")
//                 $(this).addClass("active")
//              }
//         });