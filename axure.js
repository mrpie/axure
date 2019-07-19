/*! AxureEx 2018-03-17 | dejongh.dk/license */
// var $, $axure, $var;
window.open = window.open;
window.open = function () {
  "use strict";
  function initialize() {
    if (window.$) {
      $(document).ready(function () {
       setTimeout(function () {window.open('javascript:');}, 0);
      });
     } else {
      setTimeout(initialize, 0);
     }
  }
  setTimeout(initialize, 0);
  if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }
  var _open = window.open;
  var __open = function(url, a, b, c) {
      if (c !== undefined) return _open(url, a, b, c);
      if (b !== undefined) return _open(url, a, b);
      if (a !== undefined) return _open(url, a);
      return _open(url);
  };
  return function (url, a, b, c) {
    if ((url.substring(0, 11) !== "javascript:") || (!$axure)) {
      if (window.openReplace) {
        window.openReplace = false;
        window.location.replace(url);
        return false;
      }
      return __open(url, a, b, c);
    }
    if (!$axure.error) {
      var ignoreError;
      $axure.error = function (msg) {
         if (console) console.log(msg);
        if (!ignoreError) ignoreError = !confirm(msg);
        return false;
      };
      $axure.internal(function ($ax) {
        $axure.debug = $ax.globalVariableProvider.getVariableValue('Debug') !== '';
      });
      if (window.AxureExInitialize) window.AxureExInitialize();
    }
    var script = url.substring(11).trim();
    if (false && console) console.log("** " + script + " **\n");
    if ((script[0] === '/') && (script[1] === '/')) return false;
    if ((script[0] == '@') || (script[0] == '#')) {
      var args = script.split("<,>");
      var src = args[0].split(":");
      script = $axure(src[0].trim()).text();
      if (!script) return $axure.error('Widget "' + src[0] + '" not found.');
      for (var i = 1; i < args.length; i++) {
        var l = args[i].split(':');
        script = script.replace("[[" + l[0].trim() + "]]", JSON.stringify(l.slice(1).join(':')).slice(1, -1).replace("'", "\\'"));
      }
      if (src.length > 1) {
        var frame = $axure(src[1].trim()).$().children("iframe")[0];
        if (!frame) return $axure.error('Widget InlineFrame "' + src[1] + '" not found.');
        frame = (frame.contentWindow ? frame.contentWindow : frame.contentDocument.document ? frame.contentDocument.document : frame.contentDocument).document;
        frame.open("text/html", "replace");
        frame.write(script);
        frame.close();
        return false;
      }
    }
    if (script !== '') {
      if ($axure.debug) script = eval(script);
      else try {
        script = eval(script);
      } catch (err) {
        return $axure.error("Exception:\n" + err + "\n\nTrace:\n" + err.stack + "\n\nScript:\n" + script.slice(0, 1024));
      }
      if (script) return __open('javascript: ' + JSON.stringify(script) + ';', a, b, c);
    }
    return false;
  };
}();
if (console) console.log("** AxureEx **");