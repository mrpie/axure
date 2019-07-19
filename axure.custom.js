/*! AxureEx 2018-03-17 | dejongh.dk/license */
//var $, $axure, $var;
window.AxureExCustom = function () {
  $axure.ex.fn.textAreaChanged = function (textArea) {
    $('#' + textArea.elementId + '_input').trigger("input");
  };

  $axure.ex.fn.textAreaFocus = function (textArea) {
    var input = $('#' + textArea.elementId + '_input');
    var temp = input.focus().val(); input.val('').val(temp);
  };

  $axure.ex.fn.textArea = function (textArea, pushPull, style, fixed, minHeight, hint) {
    function autosize() {
      // When the hint text is shown or hidden Axure reset the style of the textArea
      if (this.style.overflow != 'hidden') $(this).css(tCss);
      // Check if text has changed
      var newText = $(this).val();
      if (newText === oldText) return;
      if (hint) {
        if ((oldText === undefined) || ((newText === '') != (oldText === ''))) {
          hint.selected(newText !== '');
          hint.selected(newText !== ''); // Axure Bug
        }
      }
      oldText = newText;
      // Calculate new height of textArae
      var scroll = $(document).scrollTop();
      this.style.top = (oldHeight - 10) + "px";
      this.style.height = "10px"; 
      var newHeight = Math.max(minHeight, this.scrollHeight) + extraHeight;
      this.style.height = newHeight + "px"; 
      this.style.top = "0px";
      // Update height of parent div
      if (parent.height() != newHeight) parent.height(newHeight);
      $("html,body").scrollTop(scroll);
      // Is Height Changed?
      if (newHeight != oldHeight) {
        // Update height of hint
        if (hint) hintElement.css('height', newHeight + hintOffset + "px");
        // Prevent "fixed" elements to be affected by push/pull
        if (fixed) fixed.moveBy(0, -10000, {});
        // Push/pull elements
        var pSize = pushPull.size();
        var pHeight = Math.abs(newHeight - oldHeight);
        if (pSize.height != pHeight) {
          pushPull.resize({
            width: pSize.width,
            height: pHeight
          }, {});
        }  
        if (newHeight > oldHeight) pushPull.show({
          showType: 'compress',
          vertical: true
        }).hide();   
        else pushPull.show().hide({
          showType: 'compress',
          vertical: true
        });
        // Move "fixed" elements back
        if (fixed) fixed.moveBy(0, 10000, {});
      }
      oldHeight = newHeight;
    }

    // Default settings
    var pCss = {}; // parent css
    var tCss = { // textArea css
      'resize': 'none',
      'overflow': 'hidden',
      'word-wrap': 'break-word'
    };
    if (minHeight <= 0) minHeight = 0; // Minimum height of text area
    var extraHeight = 5; // Must be larger than 2 (IE) and not 4 (Chrome) 
    var flickerHeight = 20; // This number depends on font size
    var hintOffset; // Distance from hint.top to textArea.top
    var hintElement; // Distance from hint.top to textArea.top

    // Adjust defualt settings according to style
    if (typeof(style) == 'string') style = style.toLowerCase();
    switch (style) {
      case 'script' :
        pCss.boxShadow = '0px 0px 8px rgba(0,0,0,0.35)';
        pCss.MozShadow = pCss.boxShadow;
        pCss.WebkitShadow = pCss.boxShadow;
        if (!minHeight) minHeight = 120;
        break;
    }

    if (pushPull.elementId) pushPull = '#' + pushPull.elementId;
    pushPull = $axure(pushPull);
    if (textArea.elementId) textArea = '#' + textArea.elementId;
    textArea = $axure(textArea);
    if (fixed && (fixed !== '')) {
      if (fixed.elementId) fixed = '#' + fixed.elementId;
      fixed = $axure(fixed);
    } else fixed = false;
    if (hint && (hint !== '')) {
      if (hint.elementId) hint = '#' + hint.elementId;
      hint = $axure(hint);
      hintOffset = textArea.top() - hint.top();
      hintElement = $('#' + hint.getElementIds()[0] + "_div");
    } else hint = false;

    // Move pushPull widget down by 1 (pushPull should not affect textArea)
    pushPull.moveBy(0, 1, {});

    // Make textArea small. Otherwise this widget will overlay other widgets...
    var size = textArea.size();
    textArea.resize({
      width: size.width,
      height: 10
    }, {});

    var oldHeight = size.height;
    var oldText;
    var elementId = textArea.getElementIds()[0];
    var parent = $('#' + elementId);
    parent.css(pCss);
    var element = $('#' + elementId + '_input').on('input', autosize);
    element.each(autosize);

    // Stop IE from flickering 
    if ($axure.ex.ieVersion > 0) {
      element.on('keypress', function(e) {
        if ((e.keyCode || e.which) == 13) this.style.height = oldHeight + flickerHeight + "px";
      }).on('keyup', function(e) {
        if (this.style.height !== oldHeight + "px") this.style.height = oldHeight + "px";
      });
    }

    // Enable hint to show focus
    if (hint) {
      element.on('focus', function (e) {
        hint.enabled(false);
      }).on('blur', function (e) {
        hint.enabled(true);
        hint.selected(oldText !== '');
        hint.selected(oldText !== ''); // Axure Bug
      });
    }
  };

  $axure.ex.fn.style = function (style, widget) {
    var css = {};
    css.border = '1px solid #eeeeee';
    if (typeof(wigdet) == 'string')
      widget = $axure('@' + widget);
    else
      widget = $axure('#' + widget.elementId);
    widget.css(css);
  };

  $axure.ex.fn.focus = function (widget, index, delay) {debugger;
    widget = widget.elementId;
    if (index !== undefined) widget = widget.split('-')[0] + '-' + index;
    if (delay === undefined) $('#' + widget + '_input').focus();
    else setTimeout(function(){
      $('#' + widget + '_input').focus();
    },1);
  };

  $axure.ex.fn.formatDate = function(date) { /* 2014-02-11 10:20 */
    return date.substr(8, 2) + '-' + date.substr(5, 2) + '-' + date.substr(0, 4) + ' ' + date.substr(11, 5);
  };

  $axure.ex.fn.formatZero = function(value, length) {
    return ("0000000000" + value).slice(-length);
  };

  $axure.ex.fn.formatMoney = function(value) {
    var n = 2,
      x = 3,
      s = '.',
      c = ',';
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')';
    var num = parseFloat(value).toFixed(Math.max(0, ~~n));
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  };

  // $axure.setGlobalVariable('ScrollBarWidth', $axure.ex.scrollBarSize().width.toString());

  // Hide all notes
  // $axure.ex.labelContains('@!Note.').hide();

  // Allways show vertical scrollbar (move this to viewport tag, to show scrollbar when pages loads)
  // $('body').css('overflow-y', 'scroll');
};