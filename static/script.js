$(function() {

  if($('.member-tab').hasClass('active-tab')){
    $('.member-login').removeClass('d-none');
  }else{
    $('.sponsor-login').removeClass('d-none');
  }

  $('.login-tab').click(function(e) {
    e.preventDefault();
    if(!$(this).hasClass('active-tab')){
      //change tabs
      $('.active-tab').removeClass('active-tab').addClass('inactive-tab');
      $(this).removeClass('inactive-tab').addClass("active-tab");
      
      //change forms
      $('form').each(function() {
        if($(this).hasClass('d-none')){
          $(this).removeClass('d-none');
        }else{
          $(this).addClass('d-none');
        }
      })
    }
  });

  $('.rename').click(function(e){
    e.preventDefault();
    $(this).parent().parent().siblings('.rename-row').toggleClass('d-none');
    $(this).parent().parent().siblings('.padding').toggleClass('d-none');
  });

  $('.account').click(function() {
    $('.account-settings').toggleClass('d-none');
    $(".account-settings").siblings().toggleClass("inactiveLink")
  })
});