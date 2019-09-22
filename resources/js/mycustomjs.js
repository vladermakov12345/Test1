$(document).ready(function () {
    //Initialize tooltips
    $('.nav-tabs > li a[title]').tooltip();

    //Wizard
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

        var $target = $(e.target);

        if ($target.parent().hasClass('disabled')) {
            return false;
        }
    });

    $(".next-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        $active.next().removeClass('disabled');
        nextTab($active);

    });
    $(".prev-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        prevTab($active);

    });

    //initialize slidebars (navigation in mobile mode)
    /*$.slidebars({
        siteClose: true, // Enables closing of a Slidebar by clicking on the site. Options: true, false. Default: true.
        disableOver: false, // Disable Slidebars over specified screen width. Options: integer, false. Default: false.
        hideControlClasses: false // Hide Slidebar control classes over width specified in disableOver. Options: true, false. Default: false.
        //scrollLock: false // Prevent site content scrolling whilst a Slidebar is open. Options: true, false. Default: false.
    });
    */

    //initialize scroll (ex. when you click on splash page learn more)
    //jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function () {
        $('a.page-scroll').bind('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });

});

function nextTab(elem) {
    $(elem).next().find('a[data-toggle="tab"]').click();
}
function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}