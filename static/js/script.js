if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(function (reg) {}).catch(function (err) {});
}

$(function () {
  if (!Array.prototype.last) {
    Array.prototype.last = function () {
      return this[this.length - 1];
    };
  };
  if(location.pathname == "/sponsor" || location.pathname == "/sponsor/"){
    if (window.location.hash == "" || window.location.hash === '#positions-tab-nav') {
      $('#positions-tab').tab('show')
    } else if (window.location.hash === '#news-tab-nav') {
      $('#news-tab').tab('show')
    } else if (window.location.hash === '#info-tab-nav') {
      $('#info-tab').tab('show')
    }
  }

  //admin
  $('.option').each(function() {
    var curr = $(this).attr('data')
    $(this).children().each(function(){
      if($(this).val() === curr){
        $(this).attr('selected', true)
      }else{
        $(this).attr('selected', false)
      }
    })
  })


  if ($('.member-tab').hasClass('active-tab')) {
    $('.member-login').removeClass('d-none')
  } else {
    $('.sponsor-login').removeClass('d-none')
  }

  $('.login-tab').click(function (e) {
    e.preventDefault()
    if (!$(this).hasClass('active-tab')) {
      // change tabs
      $('.active-tab').removeClass('active-tab').addClass('inactive-tab')
      $(this).removeClass('inactive-tab').addClass('active-tab')

      // change forms
      $('form').each(function () {
        if ($(this).hasClass('d-none')) {
          $(this).removeClass('d-none')
        } else {
          $(this).addClass('d-none')
        }
      })
    }
  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    window.location.hash = e.target['id'] + '-nav'
  })

  $('.show-document').click(function (e) {
    e.preventDefault()
    let documents = $(this).closest('.documents').find('.d-none')
    documents.first().removeClass('d-none')
    if (documents.length <= 1) {
      $(this).addClass('d-none')
    }
  })

  $('.hide-document').click(function (e) {
    e.preventDefault()
    $(this).parent().addClass('d-none')
    $(this).siblings('input').each(function () {
      $(this).val('')
    })
    $(this).closest('.row').find('.in-file').val('')
    $(this).siblings('.ext').html('')
    $(this).siblings('.doc-name').prop('disabled', true)
    $(this).closest('.documents').find('.show-document').removeClass('d-none')
  })

  $('.hide-document-0').click(function (e) {
    e.preventDefault()
    $(this).siblings('input').each(function () {
      $(this).val('')
    })
    $(this).closest('.row').find('.in-file').val('')
    $(this).siblings('.ext').html('')
    $(this).siblings('.doc-name').prop('disabled', true)
  })

  $('input:file').change(function () {
    var button = $(this).closest('button')
    var clear = button.next()
    var input = button.prev().prev()
    var filename = $(this).val().split('\\').last().split('.')
    var extension = ''
    if (filename.length > 1) {
      extension = '.' + filename.pop()
    }
    if(filename[0]){
      input.prop('disabled', false)
      clear.prop('disabled', false)
    }else{
      input.prop('disabled', true)
      clear.prop('disabled', true)
    }
    input.val(filename)
    button.prev().html(extension)
  })

  $('.upload').bind('click', function () {
    $(this).find('input')[0].click()
  })

  $('.apply-dropdown').click(function (e) {
    e.preventDefault()
    $(this).find('span').toggleClass('octicon-chevron-up octicon-chevron-down ')
    var element = $(this).closest('ul').find('.apply').first()
    if (element.hasClass('d-none')) {
      element.hide()
      element.removeClass('d-none')
      element.slideDown()

      element.find('.show-md').each(function () {
        if ($(this).height() > 300) {
          $(this).parent().addClass('sidebar-box')
          $(this).next().removeClass('d-none')
        }
      })
    } else {
      element.slideUp(function () {
        element.addClass('d-none')
      })
    }
  })

  $('.account').click(function () {
    $('.account-settings').toggleClass('d-none')
    $('.account-settings').siblings().toggleClass('inactiveLink')
  })

  // LIVE PREVIEW
  $('.live .title').on('input', function () {
    $(this).closest('.live').find('.preview-title').html($(this).val())
    if ($(this).val().trim()) {
      $(this).closest('.live').find('button').prop('disabled', false)
    } else {
      $(this).closest('.live').find('button').prop('disabled', true)
    }
  })

  $('.live .link').on('input', function () {
    var live = $(this).closest('.live').find('.preview-link')
    if ($(this).val()) {
      live.html('<img src="/assets/images/icons/link.svg" width="30px"> Link')
      live.attr('href', $(this).val())
    } else {
      live.html('')
    }
  })

  $('.live .email').on('input', function () {
    var live = $(this).closest('.live').find('.preview-email')
    if ($(this).val()) {
      live.html('<img src="/assets/images/icons/link.svg" width="30px"> Email')
      live.attr('href', 'mailto:' + $(this).val())
    } else {
      live.html('')
    }
  })

  $('.live .text').on('input', function () {
    $(this).closest('.live').find('.preview-text').html(markdown.toHTML($(this).val()))
  })

  //markdown render
  $('.render-md').each(function () {
    if ($(this).attr('value')) {
      $(this).html(markdown.toHTML($(this).attr('value')))
    }
  })

  $('.show-md').each(function () {
    if ($(this).height() > 300) {
      $(this).parent().addClass('sidebar-box')
      $(this).next().removeClass('d-none')
    }
  })

  //sponsor description shorten for members

  $(".read-more .button").click(function () {
    $(this).hide();
    var element = $(this).closest('.sidebar-box')
    element.removeClass('sidebar-box');
    return false
  });
})