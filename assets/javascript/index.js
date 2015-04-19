// auto-generated DOM ids are prefixed with `user-content-` for security reasons
// this checks whether someone has clicked on an auto-generated id, and updates
// the URL fragment to not include the prefix.

var $ = require('jquery'),
  hashchange = require('hashchange');

hashchange.update(function (hash) {
  var prefix = 'user-content-'

  if (hash.indexOf(prefix) === 0) {
    hashchange.updateHash(hash.replace(prefix, ''))
  } else {
    var anchor = $('#' + prefix + hash)
    if (anchor.length) $(document).scrollTop(anchor.offset().top)
  }
})

$(document).ready(function () {
  hashchange.update()
});
