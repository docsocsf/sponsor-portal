$(function() {

  if(window.location.hash === '#positions-tab') {
    $('#positions-tab').tab('show')
  } else if(window.location.hash === '#news-tab') {
    $('#news-tab').tab('show')
  } else if(window.location.hash === '#info-tab') {
    $('#info-tab').tab('show')
  }




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

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    window.location.hash = e.target['id'] 
  })

  $('#show-document').click(function(e){
    e.preventDefault();
    let element = $(this).closest('.row').find('.d-none').first()
    if(element.length) 
      element.removeClass('d-none')
    else
      $(this).addClass('d-none')
  });

  $('.apply-dropdown').click(function(e){
    e.preventDefault()
    $(this).closest('ul').find('.apply').first().toggleClass('d-none')
  })

  $('.account').click(function() {
    $('.account-settings').toggleClass('d-none');
    $(".account-settings").siblings().toggleClass("inactiveLink")
  })

  $('.pass').click(function() {
    if($(this).parent().prev()[0].type === "password") {
      $(this).parent().prev()[0].type = "text"
    } else {
      $(this).parent().prev()[0].type = "password"
    }
  })
});