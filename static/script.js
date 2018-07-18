$(function() {
    $('.login-tab').click(function(e) {
        e.preventDefault();
        if(!$(this).hasClass('active-tab')){
            //change tabs
            $('.active-tab').removeClass('active-tab').addClass('inactive-tab');
            $(this).removeClass('inactive-tab').addClass("active-tab");
            
            //change forms
            $('form').each(function() {
                if($(this).hasClass('hidden-form')){
                    $(this).removeClass('hidden-form');
                }else{
                    $(this).addClass('hidden-form');
                }
            })
            
        }
    });
});