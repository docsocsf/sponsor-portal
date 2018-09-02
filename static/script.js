$(function() {
  if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
  };


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

  $('.show-document').click(function(e){
    e.preventDefault();
    let documents = $(this).closest('.documents').find('.d-none')
    documents.first().removeClass('d-none')
    if(documents.length <= 1) 
      $(this).addClass('d-none')
  })

  $("input:file").change(function (){
    var filename = $(this).val().split('\\').last().split('.')
    var extension = filename.pop()
    $(this).prev().val(filename)
  })

  $('.hide-document').click(function(e){
    e.preventDefault();
    $(this).parent().addClass('d-none')
    $(this).siblings("input").each(function(){
      $(this).val('')
    })
    $(this).closest('.documents').find('.show-document').removeClass('d-none')
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