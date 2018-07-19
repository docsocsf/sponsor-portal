$(function() {
  $('.login-tab').click(function(e) {
    e.preventDefault();
    if(!$(this).hasClass('active-tab')){
      //change tabs
      $('.active-tab').removeClass('active-tab').addClass('inactive-tab');
      $(this).removeClass('inactive-tab').addClass("active-tab");
      
      //change forms
      $('form').each(function() {
        if($(this).hasClass('hidden')){
          $(this).removeClass('hidden');
        }else{
          $(this).addClass('hidden');
        }
      })
    }
  });

  $('.rename').click(function(e){
    e.preventDefault();
    console.log($(this).closest('.rename-row').html());
    $(this).parent().parent().siblings('.rename-row').toggleClass('d-none');
    $(this).parent().parent().siblings('.padding').toggleClass('d-none');
  });

  $('.radio').click(function(){
    $(this).parent().parent().find('input').each(function(){
      $(this).prop('checked', false);
    });
    $(this).prop('checked', true);
  });

  $('.color:odd').each(function(){
    $(this).addClass('color1');
  })

  $('.color:even').each(function(){
    $(this).addClass('color2');
  })
});