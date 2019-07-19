/*! AxureEx 2018-03-17 | dejongh.dk/license */
//var $, $axure, $var;
window.AxureExInitialize = function () {
  function execute(name) {
    var script = $axure(name).text();
    if (script) {
       if (console) console.log('** Override ' + name + ' **');
       $axure(name).text('');
       script = script.substring(script.indexOf("\n") + 1, script.lastIndexOf("\n"));
       Function(script)();
       return true;
     }
  }
  if (execute('@AxureEx.Shared')) {
     window.AxureExInitialize();
     return;
  }
  execute('@AxureEx.Import');
  window.AxureExImport();

  // Store global variables as $var.hello = 'world';
  window.$var = {};

  // Initialize Axure extension object
  $axure.ex = {
    fn: {}
  };

  // Get Axure private object
  var $ax;
  $axure.internal(function (ax) {
    $ax = ax;
  });

  // Get Axure Version
  $axure.ex.axVersion = $ax.public.fn.rotate ? 8 : 7;

  // Get IE Version
  $axure.ex.ieVersion = 0;
  if (navigator.appName == 'Microsoft Internet Explorer') {
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) !== null) $axure.ex.ieVersion = parseFloat(RegExp.$1);
  }

  // Bug fix
  // Restore original String.prototype.replace. Axure version is slow.

  // Make Axure 8 more compatible with Axure 7
  if ($axure.ex.axVersion == 8) {
    var __getParents = $ax.public.fn.getParents;
    $ax.public.fn.getParents = function (a, b) {
      if (b === undefined) return __getParents.call(this, a, '*');
      return __getParents.apply(this, arguments);
    };
    var __moveTo = $ax.public.fn.moveTo;
    $ax.public.fn.moveTo = function (x, y, a) {
      if (a === undefined) return __moveTo.call(this, x, y, {});
      return __moveTo.apply(this, arguments);
    };
    var __moveBy = $ax.public.fn.moveBy;
    $ax.public.fn.moveBy = function (x, y, a) {
      if (a === undefined) return __moveBy.call(this, x, y, {});
      return __moveBy.apply(this, arguments);
    };
  }

  // Bug fix (I think it is not relevant anymore)
  /* if ($ax.dynamicPanelManager.getShownState === undefined) {
     $ax.dynamicPanelManager.getShownState = function (elementId) {
     }
  } */

  // Fix name of setPanelState function
  if ($ax.public.fn.setPanelState === undefined) {
    $ax.public.fn.setPanelState = $ax.public.fn.SetPanelState;
  }

  // Fix exception in IE7
  if ($axure.ex.ieVersion && ($axure.ex.ieVersion <= 8)) {
    var _getEventInfoFromEvent = $ax.getEventInfoFromEvent;
    $ax.getEventInfoFromEvent = function () {
      try {
        return _getEventInfoFromEvent.apply(this, arguments);
      } catch (e) {
        arguments[0] = null;
        return _getEventInfoFromEvent.apply(this, arguments);
      }
    };
  }

  // Bug fix: https://github.com/itorrey/EpiPen/blob/master/plugins/EpiPen/epi.js
  if ($axure.getGlobalVariable('PageName') === undefined) {
    $ax.public.getGlobalVariable = $ax.getGlobalVariable = function (name) {
      return $ax.globalVariableProvider.getVariableValue(name);
    };
  }

  // Utility function
  function _log_alert(args) {
    var message = '',
      value = '';
    for (var i = 0; i < args.length; i++) {
      value = args[i];
      message += value;
    }
    return {
      message: message,
      value: value
    };
  }

  // Is a widget visible
  $axure.ex.isVisible = function (elementId) {
    return $ax.visibility.IsIdVisible(elementId);
  };
  $ax.public.fn.exIsVisible = $ax.public.fn.isVisible = function (all) {
    var elementIds = this.getElementIds();
    var result = all;
    for (var index = 0; index < elementIds.length; index++) {
      var elementId = elementIds[index];
      var visible = $ax.visibility.IsIdVisible(elementId);
      if (all) result = result && visible;
      else result = result || visible;
    }
    return result;
  };

  // Assign image form one widget to another
  // $axure.ex.image(sourceId) - return image source
  // $axure.ex.image(elementId, sourceId) - set image of element to image of other element
  // This function does not work very well. Look at _actionHandlers.setImage
  $axure.ex.image = function (elementId, sourceId) {
    if (!sourceId) return $('#' + elementId + '_img').attr('src');
    $('#' + elementId).attr('src', $('#' + sourceId + '_img').attr('src'));
    return this;
  };

  // Get bounds of widget with given elementId. Axure 8 have native functions to do this.
  // Bug: Does not work on hidden "fit to contents" panels.
  $axure.ex.getBounds = function (elementId) {
    var element = $('#' + elementId);
    var bounds = {
      id: elementId,
      left: parseFloat($(element).css('left'), 10),
      top: parseFloat($(element).css('top'), 10),
      width: parseFloat($(element).css('width'), 10),
      height: parseFloat($(element).css('height'), 10),
      x: 0,
      y: 0,
      right: 0,
      bottom: 0
    };
    bounds.x = bounds.left;
    bounds.y = bounds.top;
    bounds.right = bounds.left + bounds.width;
    bounds.bottom = bounds.top + bounds.height;
    return bounds;
  };

  // Get size and position of first or all widgets of query
  $ax.public.fn.exGetBounds = $ax.public.fn.getBounds = function (all) {
    var elementIds = this.getElementIds();
    if (!all) return $axure.ex.getBounds(elementIds[0]);
    var result = [];
    for (var index = 0; index < elementIds.length; index++) result.push($axure.ex.getBounds(elementIds[index]));
    return result;
  };

  // Enable [[this.label]] or [[this]] gives the id not the name of the widget
  /* var _getWidgetInfo = $ax.getWidgetInfo;
  $ax.getWidgetInfo = function (elementId) {
    var widget = _getWidgetInfo(elementId);
    if (widget.valid) widget.label = '#' + elementId;
    return widget;
  }; */

  // Get properties of widget with given elementId
  $axure.ex.getWidgetInfo = $ax.getWidgetInfo;

  // Get size and position of first or all widgets of query
  $ax.public.fn.exGetWidgetInfo = $ax.public.fn.getWidgetInfo = function (all) {
    var elementIds = this.getElementIds();
    if (!all) return $axure.ex.getWidgetInfo(elementIds[0]);
    var result = [];
    for (var index = 0; index < elementIds.length; index++) result.push($axure.ex.getWidgetInfo(elementIds[index]));
    return result;
  };

  // Get the names and indexes of dynamic panel states
  $axure.ex.getPanelStates = function (elementId) {
    var result = [];
    for (var index = 1;; index++) {
      var element = $('#' + elementId + '_state' + (index - 1));
      if (!element.length) break;
      var name = element.attr('data-label');
      result[index] = name;
      result[name] = index;
    }
    return result;
  };
  $ax.public.fn.exGetPanelStates = $ax.public.fn.getPanelStates = function () {
    return $axure.ex.getPanelStates(this.getElementIds()[0]);
  };

  // Get the state number of a dynamic panel
  $axure.ex.getPanelState = function (elementId) {
    var state = $ax.visibility.GetPanelState(elementId);
    return parseInt(state.split('_state')[1], 10) + 1;
  };
  $ax.public.fn.exGetPanelState = $ax.public.fn.getPanelState = function () {
    return $axure.ex.getPanelState(this.getElementIds()[0]);
  };

  // Get the state name of a dynamic panel
  $axure.ex.getPanelStateName = function (elementId) {
    return $axure.ex.getPanelStates(elementId)[$axure.ex.getPanelState(elementId)];
  };
  $ax.public.fn.exGetPanelStateName = $ax.public.fn.getPanelStateName = function () {
    return $axure.ex.getPanelStateName(this.getElementIds()[0]);
  };

  // Set the state of a dynamic panel by state name
  $ax.public.fn.exSetPanelStateByName = $ax.public.fn.setPanelStateByName = function (stateName, options, showWhenSet) {
    var ids = this.getElementIds();
    for (var index = 0; index < ids.length; index++) {
      var id = ids[index];
      var stateNumber = $axure.ex.getPanelStates(id)[stateName];
      if (stateNumber) $axure('#' + id).SetPanelState(stateNumber, options, showWhenSet);
    }
  };

  // Get parent of widget (ignore masters and dynamic panel states)
  $ax.public.fn.exGetParent = $ax.public.fn.getParent = function (all, state) {
    var parents = this.getParents(false, '*');
    var result = [];
    for (var index = 0; index < parents.length; index++) {
      var parent = parents[index];
      if (parent !== undefined) {
        if (!$('#' + parent).length) parent = $axure('#' + parent).exGetParent(false, state);
        else if (!state) parent = parent.split('_state')[0];
      }
      if (!all) return parent;
      result.push(parent);
    }
    return result;
  };

  // Get all global variables
  $axure.ex.getGlobalVariables = function (option) {
    var definedVariables = $ax.globalVariableProvider.getDefinedVariables();
    var vars = [],
      val, key;
    for (var i = 0; i < definedVariables.length; i++) {
      key = definedVariables[i];
      if (option === 'default') val = $ax.document.globalVariables[key.toLowerCase()];
      else val = $ax.globalVariableProvider.getVariableValue(key, undefined, option === 'excludeDefault');
      if (val !== null) {
        vars.push(key);
        vars[key] = val;
      }
    }
    return vars;
  };

  // Get size of scrollbars
  var scrollBarSize;
  $axure.ex.scrollBarSize = function () {
    if (scrollBarSize === undefined) {
      var div = document.createElement("div");
      div.style.overflow = "scroll";
      div.style.visibility = "hidden";
      div.style.position = 'absolute';
      div.style.width = '100px';
      div.style.height = '100px';
      document.body.appendChild(div);
      scrollBarSize = {
        width: div.offsetWidth - div.clientWidth,
        height: div.offsetHeight - div.clientHeight
      };
      document.body.removeChild(div);
    }
    return scrollBarSize;
  };

  // Find widgets that are children of other widgets
  // todo: make version of this method that work on elementIds
  $axure.ex.getChildOf = function (widgets, parents, deep) {
    if (typeof (widgets) == 'string') widgets = $axure(widgets);
    if (typeof (parents) == 'string') parents = $axure(parents);
    var parentIds = parents.query ? parents.getElementIds() : parents;
    var widgetIds = widgets.query ? widgets.getElementIds() : widgets;
    var found = [];
    var allParents, parent, i, id;
    if (deep || (deep === undefined)) {
      allParents = widgets.getParents(true, '*');
      for (i = 0; i < allParents.length; ++i) {
        id = widgetIds[i];
        parents = allParents[i];
        for (var ii = 0; ii < parents.length; ++ii) {
          parent = parents[ii].split('_state')[0];
          if (parentIds.indexOf(parent) >= 0) {
            if (!found[id]) {
              found[id] = true;
              found.push(id);
            }
            break;
          }
        }
      }
    } else {
      allParents = widgets.exGetParent(true, false);
      for (i = 0; i < allParents.length; ++i) {
        id = widgetIds[i];
        parent = allParents[i];
        if (parentIds.indexOf(parent) >= 0) {
          if (!found[id]) {
            found[id] = true;
            found.push(id);
          }
        }
      }
    }
    return found;
  };
  $axure.ex.childOf = function (widgets, parents, deep) {
    var children = $axure.ex.getChildOf(widgets, parents, deep);
    return $axure(function (element, elementId) {
      return children[elementId] === true;
    });
  };

  // Find widgets that are siblings of other widgets
  $axure.ex.getSiblingOf = function (widgets, siblings) {
    if (typeof (widgets) == 'string') widgets = $axure(widgets);
    if (typeof (siblings) == 'string') siblings = $axure(siblings);
    // var widgetIds = widgets.query ? widgets.getElementIds() : widgets;
    var parentIds;
    if (siblings.query) {
       parentIds = siblings.getParents(false, '*');
    } else {
       parentIds = [];
       for (var i = 0; i++; i < siblings.length)
         parentIds.push($axure('#' + siblings[i]).getParents(false, '*')[0]);
    }
    return $axure.ex.getChildOf(widgets, parentIds);
  };
  $axure.ex.siblingOf = function (widgets, siblings) {
    siblings = $axure.ex.getSiblingsOf(widgets, siblings);
    return $axure(function (element, elementId) {
      return siblings[elementId] === true;
    });
  };
   
  // Find widgets that are parents of other widgets
  // todo: make version of this method that work on elementIds
  $axure.ex.getParentOf = function (widgets, children, deep) {
    if (typeof (widgets) == 'string') widgets = $axure(widgets);
    if (typeof (children) == 'string') children = $axure(children);
    var found = [];
    var parentIds = widgets.query ? widgets.getElementIds() : widgets;

    var allParents, parents, parent, index, i;
    if (deep || (deep === undefined)) {
      allParents = children.getParents(true, '*');
      for (i = 0; i < allParents.length; ++i) {
        parents = allParents[i];
        for (var ii = 0; ii < parents.length; ++ii) {
          parent = parents[ii].split('_state')[0];
          index = parentIds.indexOf(parent);
          if (index >= 0) {
            if (!found[parent]) {
              found[parent] = true;
              found.push(parent);
            }
            parentIds.splice(index, 1);
            if (!parentIds.length) allParents = [];
            break;
          }
        }
      }
    } else {
      allParents = widgets.exGetParent(true, false);
      for (i = 0; i < allParents.length; ++i) {
        parent = allParents[i];
        index = parentIds.indexOf(parent);
        if (index >= 0) {
          if (!found[parent]) {
            found[parent] = true;
            found.push(parent);
          }
          parentIds.splice(index, 1);
          if (!parentIds.length) break;
        }
      }
    }
    return found;
  };
  $axure.ex.parentOf = function (widgets, children, deep) {
    var parents = $axure.ex.getParentOf(widgets, children, deep);
    return $axure(function (element, elementId) {
      return parents[elementId] === true;
    });
  };

  // Find widgets that are owned by a page or master
  // todo: make version of this method that work on elementIds
  $axure.ex.ownerContains = function (widgets, owner) {
    if (typeof (widgets) === 'string') widgets = $axure(widgets);
    if (widgets) widgets = widgets.query ? widgets.getElementIds() : widgets;
    return $axure(function (element, elementId) {
      if (('@' + element.owner.name + '@').indexOf(owner) >= 0) {
        return (!widgets) || (widgets.indexOf(elementId) >= 0);
      }
    });
  };

  // Find widgets that contain a substring in their name
  //   widgets: '@name' '#id' $axure('query') ['id', 'id', 'id']
  //   label: '@label@'
  $axure.ex.labelContains = function (widgets, label) {
    // Enable this function to be called with label as first argument (backwards compability)
    if (label === undefined) { 
      label = widgets;
      widgets = undefined;
    }
    if (typeof (widgets) === 'string') widgets = $axure(widgets);
    if (widgets) widgets = widgets.query ? widgets.getElementIds() : widgets;
    return $axure(function (element, elementId) {
      if (('@' + element.label + '@').indexOf(label) >= 0) {
        return (!widgets) || (widgets.indexOf(elementId) >= 0);
      }
    });
  };

  // Map label to id of children of a dynamic panel (fast)
  $axure.ex.mapChildren = function (panelId, state, deep) {
    function _each(i, e) {
      var q = $(e);
      var n = q.attr('data-label');
      if (n) {
        var id = q.attr('id');
        if (id && (id.indexOf('_state') < 0)) map[n] = id;
      }
    }
    var map = {};
    var query = $('#' + panelId);
    switch (typeof (state)) {
    case 'string':
      query = query.children('[data-label="' + state + '"]');
      break;
    case 'number':
      query = query.children('#' + panelId + '_state' + (state - 1));
      break;
    default:
      query = query.children('div');
      break;
    }
    if (deep)
      query.children('div').find('div').each(_each);
    else
      query.children('div').children('div').each(_each);
    return map;
  };
  $ax.public.fn.mapChildren = $ax.public.fn.exMapChildren = function (state, deep) {
    return $axure.ex.mapChildren(this.getElementIds()[0], state, deep);
  };

  // -------------------------------------------------------------------------------------------------------------------------------------
  // Repeaters
  // -------------------------------------------------------------------------------------------------------------------------------------

  // Find repeater object with given id
  function getRepeater(repeaterId) {
    var repeater;
    $axure(function(obj) {
      return obj.type == 'repeater';
    }).each(function(obj, id) {
      if (id == repeaterId) {
        repeater = obj;
      }
    });
    return repeater;
  }

  // Get all row ids from repeater
  $axure.ex.getRepeaterRows = $ax.repeater.getAllItemIds;
  $ax.public.fn.exGetRepeaterRows = $ax.public.fn.getRepeaterRows = function () {
    return $axure.ex.getRepeaterRows(this.getElementIds()[0]);
  };
  
  // Mark rows in repeater
  //   rows: [row, row, row, ...]
  $axure.ex.markRepeaterRows = $ax.repeater.addEditItems;
  $ax.public.fn.exMarkRepeaterRows = $ax.public.fn.markRepeaterRows = function (rows) {
    $axure.ex.markRepeaterRows(this.getElementIds()[0], rows);
    return this;
  };
  
  // Unmark rows in repeater
  //   rows: [row, row, row, ...]
  $axure.ex.unmarkRepeaterRows = $ax.repeater.removeEditItems;
  $ax.public.fn.exUnmarkRepeaterRows = $ax.public.fn.unmarkRepeaterRows = function (rows) {
    $axure.ex.unmarkRepeaterRows(this.getElementIds()[0], rows);
    return this;
  };

  // Refresh repeater HTML (render repater)
  $axure.ex.refreshRepeater = $ax.repeater.refreshRepeater;
  $ax.public.fn.exRefreshRepeater = $ax.public.fn.refreshRepeater = function () {
    $axure.ex.refreshRepeater(this.getElementIds()[0]);
    return this;
  };

  // Copy data from one repeater to another
  $axure.ex.copyRepeaterData = function(targetId, sourceId) {
    /*
    $axure.ax.repeater.setDataSet(targetId, sourceId);
    var target = $axure.ex.getRepeater(targetId);
    var source = $axure.ex.getRepeater(sourceId);
    target.data = source.data;
    */
    var rows = $axure.ex.getRepeaterData(sourceId);
    $axure.ex.clearRepeaterData(targetId);
    $axure.ex.addRepeaterData(targetId, rows);
  };
  $ax.public.fn.exCopyRepeaterData = $ax.public.fn.copyRepeaterData = function (source) {
    $axure.ex.copyRepeaterData(this.getElementIds()[0], source.getElementIds()[0]);
    return this;
  };

  // Get data from text
  //  text: 
  //  rows: not supported
  //  columns: not supported
  //  seperator: 
  $axure.ex.getTextData = function(text, rows, columns, separator) {
    if (separator === undefined) separator = ';';
    var data = [];
    var lines = text.match(/[^\r\n]+/g);
    var header = lines[0].split(separator);
    for (var i = 0; i < header.length; i++) {
      header[i] = header[i].trim().toLowerCase();
    }
    for (i = 1; i < lines.length; i++) {
      var line = lines[i].split(separator);
      var row = {};
      for (var j = 0, c = Math.min(line.length, header.length); j < c; j++) {
        row[header[j]] = {type: 'text', text: line[j].trim()};
      }
      data.push(row);
    }
    return data;
  };
  $ax.public.fn.exGetTextData = $ax.public.fn.getTextData = function (rows, columns, separator) {
    return $axure.ex.getTextData(this.text(), rows, columns, separator);
  };

  // Get data from repeater
  //   repeaterId: id of repeater widget
  //   rows: widget id | row id | array of widget id | array of row id | undefined
  //   columns:  column name | array of column name | undefined
  $axure.ex.getRepeaterData = function(repeaterId, rows, columns) {
    var ids = rows;
    if (ids === undefined) {
      ids = $axure.ex.getRepeaterRows(repeaterId);
    } else if (typeof(ids) != 'object') {
      ids = [ids];
    }
    if (columns === undefined) {
      columns = getRepeater(repeaterId).dataProps;
    } else if (typeof(columns) != 'object') {
      columns = [columns];
    }
    rows = [];
    for (var i = 0, il = ids.length; i < il; i++) {
      var row = {};
      for (var j = 0, jl = columns.length; j < jl; j++) {
        var name = columns[j].toLowerCase();
        var id = ids[i];
        if ((typeof(id) == 'string') && (id.indexOf('-') != -1)) id = $ax.repeater.getItemIdFromElementId(id);
        var value = $ax.repeater.getData({}, repeaterId, ids[i], name, 'data');
        if (typeof(value) == 'object') {
          value = $ax.deepCopy(value);
          if (value.type === undefined) value.type = 'text';
          row[name] = value;
        } else {
          row[name] = {type: 'text', text: value};
        }
      }
      rows.push(row);
    }
    return rows;
  };
  $ax.public.fn.exGetRepeaterData = $ax.public.fn.getRepeaterData = function (rows, columns) {
    return $axure.ex.getRepeaterData(this.getElementIds()[0], rows, columns);
  };

  // Remove all data from repeater
  $axure.ex.clearRepeaterData = function(repeaterId) {
    var ids = $axure.ex.getRepeaterRows(repeaterId);
    $ax.repeater.addEditItems(repeaterId, ids);
    $ax.repeater.deleteItems(repeaterId, {}, 'marked', undefined);
  };
  $ax.public.fn.exClearRepeaterData = $ax.public.fn.clearRepeaterData = function () {
    $axure.ex.clearRepeaterData(this.getElementIds()[0]);
    return this;
  };

  // Add data to repeater
  //   rows: {name: {type: 'text', text: 'value'}}
  $axure.ex.addRepeaterData = function(repeaterId, rows) {
    var event = {
      targetElement: undefined,
      srcElement: undefined
    };
    var repeater = getRepeater(repeaterId);
    var columns = repeater.dataProps;
    for (var i = 0, il = rows.length; i < il; i++) {
      var source = rows[i];
      var target = {};
      for (var j = 0, jl = columns.length; j < jl; j++) {
        var column = columns[j];
        var item = source[column];
        if (item === undefined) {
          item = {type: 'text', text: ''};
        } else {
          item = $ax.deepCopy(item);
        }
        target[column] = item;
      }        
      $ax.repeater.addItem(repeaterId, target, event);
    }
  };
  $ax.public.fn.exAddRepeaterData = $ax.public.fn.addRepeaterData = function (rows) {
    $axure.ex.addRepeaterData(this.getElementIds()[0], rows);
    return this;
  };

  // Update data in repeater
  //   repeaterId: repeater widget id
  //   target: 'marked' | row-id | widget-id | [row-id] | [widget-id]
  //   row: {name: {type:'text', text:'value'}}
  $axure.ex.updateRepeaterData = function(repeaterId, target, row) {
    var event;
    if (target == 'marked') {
      event = {targetElement: undefined};
      $ax.repeater.updateEditItems(repeaterId, $ax.deepCopy(row), event, 'marked', undefined);
    } else {
      if (typeof(target) != 'object') target = [target];
      for (var i = 0, il = target.length; i < il; i++) {
        var id = target[i];
        if ((typeof(id) != 'string') || (id.indexOf('-') == -1)) id = '-' + id;
        event = {targetElement: undefined, srcElement: id};
        $ax.repeater.updateEditItems(repeaterId, $ax.deepCopy(row), event, 'this', undefined);
      }
    }
  };
  $ax.public.fn.exUpdateRepeaterData = $ax.public.fn.updateRepeaterData = function (target, row) {
    $axure.ex.updateRepeaterData(this.getElementIds()[0], target, row);
    return this;
  };

  // Set number of item per page
  //   repeaterId: repeater widget id
  //   limit: undefined | integer
  $axure.ex.setRepeaterLimit = function(repeaterId, limit) {
    if (limit === undefined) {
      $ax.repeater.setNoItemLimit(repeaterId);
    } else {
      $ax.repeater.setItemLimit(repeaterId, limit, {targetElement: undefined});
    }
  };
  $ax.public.fn.exSetRepeaterLimit = $ax.public.fn.setRepeaterLimit = function (limit) {
    return $axure.ex.setRepeaterLimit(this.getElementIds()[0], limit);
  };

  // What repeater is currently refreshing
  var _refreshStack = [];

  // Move repater.header by (0, 0) before repeater is refreshed
  function __refreshStart(repeaterId) {
    var label = $('#' + repeaterId).data('label');
    if (label) {
      $axure('@' + label + '.Header').moveBy(0, 0, {});
    }
  }
  var _refreshStart = $ax.action.refreshStart;
  $ax.action.refreshStart = function (repeaterId) {
    _refreshStack.push(repeaterId);
    var result = _refreshStart.apply(this, arguments);
    __refreshStart(repeaterId);
    return result;
  };

  // Move repater.footer to (repater.left, repater.bottom) after repater is refreshed.
  function __refreshEnd(repeaterId) {
    var repeater = $('#' + repeaterId);
    var width = 0,
      height = 0;
    repeater.children('div').each(function (i, e) {
      e = $(e);
      width = Math.max(width, parseFloat(e.css('left'), 10) + parseFloat(e.css('width'), 10));
      height = Math.max(height, parseFloat(e.css('top'), 10) + parseFloat(e.css('height'), 10));
    });
    if (false) {
      repeater.css({
        width: width + 'px',
        height: height + 'px',
      });
    }
    var label = repeater.data('label');
    if (label) {
      $axure('@' + label + '.Footer').each(function (e, id) {
        $axure('#' + id).moveTo(
          parseFloat($('#' + id).css('left'), 10),
          parseFloat(repeater.css('top'), 10) + height, {}
        );
      });
    }
  }
  var _refreshEnd = $ax.action.refreshEnd;
  $ax.action.refreshEnd = function () {
    var result = _refreshEnd.apply(this, arguments);
    __refreshEnd(_refreshStack.pop());
    return result;
  };

  // -------------------------------------------------------------------------------------------------------------------------------------
  // Expressions
  // -------------------------------------------------------------------------------------------------------------------------------------

  // Enable [["function".trim("argument", "argument", ...)]]
  var _evaluateSTO = $ax.evaluateSTO;
  $ax.evaluateSTO = function (sto, scope, eventInfo) {
    if ((sto.sto !== 'fCall') || (sto.func !== 'trim') || (sto.arguments.length === 0)) return _evaluateSTO(sto, scope, eventInfo);
    var thisObj = _evaluateSTO(sto.thisSTO, scope, eventInfo);
    if (sto.thisSTO.computedType != 'string') thisObj = thisObj.toString();
    if (false && console) console.log('** javascript in expression: ' + thisObj + ' **');
    var fn = $axure.ex.fn[thisObj.trim()];
    if (typeof (fn) !== 'function') {
      $axure.error('Error:\nFunction "' + thisObj + '" not found');
    } else {
      var args = [];
      for (var i = 0; i < sto.arguments.length; i++) {
        args.push($ax.evaluateSTO(sto.arguments[i], scope, eventInfo));
      }
      if (false) { // This does not work. AxQuery catch the exception.
        return fn.apply({scope: scope, eventInfo: eventInfo}, args);
      } else {
        try {
          return fn.apply({scope: scope, eventInfo: eventInfo}, args);
        } catch (e) {
          $axure.error('In Function:\n' + thisObj + '\n\nException:\n' + e + '\n\nTrace:\n' + e.stack);
        }
      }
    }
    return '';
  };

  // [["log".trim("hello", "world")]] > "world"
  $axure.ex.fn.log = function () {
    var result = _log_alert(arguments);
    if (console) console.log(result.message);
    return result.value;
  };

  // [["alert".trim("hello", "world")]] > "world"
  $axure.ex.fn.alert = function () {
    var result = _log_alert(arguments);
    alert(result.message);
    return result.value;
  };

  // [["select".trim(1, "a", "b", "c")]] > "b"
  $axure.ex.fn.select = function (index) {
    if (typeof (index) == 'boolean') return (index) ? arguments[1] : arguments[2];
    if (typeof (index) == 'number') return arguments[index + 1];
    return index;
  };

  // [["id".trim(widget)]] > "#id"
  $axure.ex.fn.id = function (widget, hash) {
    if ((hash === true) || (hash === undefined)) return '#' + widget.elementId;
    return widget.elementId;
  };

  // [["state".trim(widget)]] > "state"
  $axure.ex.fn.state = function (widget) {
    return $axure.ex.getPanelStateName(widget.elementId);
  };

  // [["enabled".trim(widget)]] > "true" | "false"
  // [["enabled".trim(widget, true)]] > ""
  $axure.ex.fn.enabled = function (widget, value) {
    var w = $axure('#' + widget.elementId);
    if (value === undefined) return w.enabled();
    if (value === 'toggle') w.enabled(!w.enabled());
    else switch (typeof value) {
    case 'number':
      w.enabled(value !== 0);
      break;
    case 'boolean':
      w.enabled(value);
      break;
    case 'string':
      w.enabled(value === "true");
      break;
    }
    return '';
  };

  // [["selected".trim(widget)]] > "true" | "false"
  // [["selected".trim(widget, true)]] > ""
  $axure.ex.fn.selected = function (widget, value) {
    var w = $axure('#' + widget.elementId);
    if (value === undefined) return w.selected();
    if (value === 'toggle') w.selected(!w.selected());
    else switch (typeof value) {
    case 'number':
      w.selected(value !== 0);
      break;
    case 'boolean':
      w.selected(value);
      break;
    case 'string':
      w.selected(value === "true");
      break;
    }
    return '';
  };

  // [["parent".trim(widget, levelOrName)]] = #parentId
  $axure.ex.fn.parent = function (widget, levelOrName, deep) {
    var id = '#' + widget.elementId;
    if (typeof (levelOrName) == 'string') {
      id = '#' + $axure.ex.getParentOf(levelOrName, id, deep)[0];
    } else {
      levelOrName = levelOrName ? levelOrName : 1;
      while (levelOrName--) {
        id = '#' + $axure(id).exGetParent();
      }
    }
    return id;
  };
  /* $axure.ex.fn.parent = function(widget, levelOrName, deep) {debugger;
      return $axure.ex.getWidgetInfo($axure.ex.fn.parentId(widget, levelOrName, deep).slice(1));
  }; */

  // [["child".trim(widget, indexOrName)]] = #childId
  $axure.ex.fn.child = function (widget, indexOrName, deep) {
    var id = '#' + widget.elementId;
    if (typeof (indexOrName) == 'string') {
      id = '#' + $axure.ex.getChildOf(indexOrName, id, deep)[0];
    } else {
      var children = $axure(id).getChildren(false);
      id = '#' + children[0].children[indexOrName - 1];
    }
    return id;
  };
  /*    
  $axure.ex.fn.child = function(widget, indexOrName, deep) {debugger;
      return $axure.ex.getWidgetInfo($axure.ex.fn.childId(widget, indexOrName, deep).slice(1));
  };
  */

  // [["sibling".trim(widget, indexOrName)]] = #siblingId
  $axure.ex.fn.sibling = function (widget, name) {
    var id = '#' + widget.elementId;
    return '#' + $axure.ex.getSiblingOf(name, id)[0];
  };

  // [["var".trim(name)]] > value
  // [["var".trim(name, value)]] > ""
  $axure.ex.fn.var = function (name, value) {
    if (value === undefined) return $var[name];
    $var[name] = value;
    return '';
  };

  // [["session".trim(name)]] > value
  // [["session".trim(name, value)]] > ""
  $axure.ex.fn.session = function (name, value) {
    if (value === undefined) return $axure.ex.history.session[name];
    $axure.ex.history.session[name] = value;
    return '';
  };

  // [["history".trim(name)]] > value
  // [["history".trim(name, value)]] > ""
  $axure.ex.fn.history = function (name, value) {
    if (value === undefined) return $axure.ex.history.current[name];
    $axure.ex.history.current[name] = value;
    return '';
  };

  // [["script".trim(script)]] = ?
  $axure.ex.fn.script = function (script) {
    if ($axure.debug) return eval(script);
    else try {
      return eval(script);
    } catch (err) {
      $axure.error("Exception:\n" + err + "\n\nTrace:\n" + err.stack + "\n\nScript:\n" + script.slice(0, 1024));
    }
  };

  // [["getData".trim(widget, name, ...)
  $axure.ex.fn.getData = function(widget, index, name) {
    var rows;
    if (typeof(index) != 'number') {
      name = index;
      var id = $ax.repeater.getItemIdFromElementId(widget.elementId);
      rows = $axure.ex.getRepeaterData(widget.repeater.elementId, id, name.toLowerCase());
      if (!rows.length) return '';
      var row = rows[0];
      if (row.type == 'text') return row.text;
      return 'image';
    }
    rows = $axure.ex.getRepeaterData(widget.repeater.elementId);
    return rows[index-1][name].text;
  };

  // [["setData".trim(widget, name, text | widget, ...)
  $axure.ex.fn.setData = function(widget /*, index /*, name, value*/ ) {
    var row = {};
    var i = 1;
    var index = arguments[i];                                                                    
    if (typeof(index) == 'number') i++;
    else index = widget.elementId;
    for (var il = arguments.length; i < il;) {
      var name = arguments[i++].toLowerCase();
      var value = arguments[i++];
      if (typeof(value) == 'object') {
        var image = {s0: $axure.ex.image(value.elementId)};
        value = {type: 'image', text: value.text, img: image};
      } else {
        value = {type: 'text', text: value};
      }
      row[name] = value;
    }
    $axure.ex.updateRepeaterData(widget.repeater.elementId, [index], row);
    return '';
  };

  // [["css".trim(widget, selector, name, value, ...)
  $axure.ex.fn.css = function(widget, selector /*, name, value*/ ) {
    var properties = {};
    for (var i = 2, il = arguments.length; i < il;) {
      properties[arguments[i++].toLowerCase()] = arguments[i++];
    }
    var query = typeof(widget) == 'object' ? '#' + widget.elementId : widget;
    if ((typeof(widget) != 'object') || (typeof(selector) == 'string')) {
      query += (selector === '' ? '' : ' ') + selector;
      $(query).css(properties);
    } else {
      $axure(query).css(properties);
    }
    return '';
  };

  // -------------------------------------------------------------------------------------------------------------------------------------
  // History
  // -------------------------------------------------------------------------------------------------------------------------------------

  var history = $axure.ex.history = {};

  // Get a (rather) unique id. Used by history.
  function unique() {
    var result = '' + history.unique;
    history.unique += ~~(1 + Math.random() * 100);
    return result;
    // return Math.floor(((1 + Math.random()) * 0x10000) ^ ((new Date()).getTime() & 0xFFFF)).toString(16).substring(1);
  }

  // Create a new history item. Used by history.
  history._new = function (state, hash) {
    return {
      state: state,
      hash: hash
    };
  };

  // Update selected variables in URL. Used by history.
  function updateHashParams(params, variables) {
    var name;
    if (variables === '*') variables = $ax.globalVariableProvider.getDefinedVariables();
    else if (typeof (variables) === 'string') variables = variables.split(',');
    if (typeof (variables) === 'object') {
      var values = $axure.ex.getGlobalVariables();
      for (var i = 0; i < variables.length; i++) {
        var find = variables[i];
        find = find.trim().toLowerCase();
        for (var j = 0; j < values.length; j++) {
          name = values[j].toLowerCase();
          if (name == find) {
            params[name] = values[values[j]];
            break;
          }
        }
      }
      for (name in variables) {
        if (variables.hasOwnProperty(name)) params[name.toLowerCase()] = variables[name];
      }
    }
    return params;
  }

  // Decode params in URL.
  function parseHashParams(url) {
    var vars = {},
      hash, index = url.indexOf('#');
    if (index >= 0) {
      var hashes = url.slice(index + 1).split('&');
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        if (hash[0] !== 'CSUM') vars[decodeURIComponent(hash[0]).toLowerCase()] = decodeURIComponent(hash[1]);
      }
    }
    history.unique = Math.max((~~parseInt(vars.pagehash, 10)) + 1, history.unique);
    return vars;
  }

  // Encode params in URL. Axure does not use "+" for " ".
  function encodeHashParams(params) {
    return $.param(params).replace('+', '%20');
  }

  // Get or set information in local storage. If local storage is not available "handle" exceptions.
  // https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage
  function storage(persistent, name, value) {
    try {
      var storage = persistent ? window.localStorage : window.sessionStorage;
      if (arguments.length < 3) {
        value = JSON.parse(storage.getItem(name));
        if ((value !== null) && (typeof (value) === 'object')) return value;
      } else {
        return storage.setItem(name, JSON.stringify(value));
      }
    } catch (e) {
      if (console) console.log('** storage: ' + e + ' **\n');
    }
  }
  
  // Find index of hash in history. In IE9+ and other browsers the .indexOf method could be used.
  history.find = function (hash) {
    for (var i = 0; i < history.items.length; i++) {
      if (history.items[i].hash === hash) return i;
    }
    return -1;
  };

  // Notify that this page is about to be "exited"
  function OnPageExit() {
    $axure('@AxureEx.PageLeave').moveBy(0, 0, {});
  }

  // Go to a new state and remeber old state in browser history.
  //   "state" is the new state or the number of states to go backward or forward.
  //   "updateVariables" is a list of variabes that will be updated in the URL
  //   "forwardVariables" is an object with values that will be passed to the next state
  //   "replace" replace the current state with the new state (the current state is not added to browser history)
  $axure.ex.go = function (state, updateVariables, forwardVariables, replace) {
    if (typeof (state) === 'number') {
      window.history.go(state);
    } else {
      OnPageExit();
      // var index = history.find(history.current.hash) + 1;
      // if (index > 0) history.items.length = index;
      var params = parseHashParams(location.href);
      if (false) {
        var variables = $axure.ex.getGlobalVariables('excludeDefault');
        for (var i = 0; i < variables.length; i++) {
          var name = variables[i];
          params[name.toLowerCase()] = variables[name];
        }
      } else {
        updateHashParams(params, updateVariables);
      }
      if (!replace) history.previous = history.current;
      history.current = history._new(state, unique());
      if (forwardVariables) {
        for (var attr in forwardVariables) {
          if (forwardVariables.hasOwnProperty(attr)) history.current[attr] = forwardVariables[attr];
        }
      }
      $axure.setGlobalVariable('PageState', history.current.state);
      params.pagehash = history.current.hash;
      params.pagestate = history.current.state;
      params.CSUM = 1;
      if (replace)
        location.replace('#' + encodeHashParams(params));
      else
        location.hash = encodeHashParams(params);
      onHashChange();
    }
  };

  // Reload current page. Do not add to history.
  $axure.ex.refresh = function (variables) {
    if (variables) $axure.ex.updateVariables(variables);
    document.location.reload(false);
  };

  // Prepare jumping to a new page.
  //   "state" new page state
  //   "forwardVariables" variables to set in new page state
  //   "replace" replace current page with new page in browser history. use open page in new window/tab
  //
  // $axure.document.sitemap.rootNodes enable mapping of page names to page urls
  $axure.ex.forward = function (state, forwardVariables, replace) {
    // OnPageExit();
    // var index = history.find(history.current.hash) + 1;
    // if (index > 0) history.items.length = index;
    var future = history._new(state, unique());
    if (forwardVariables) {
      for (var attr in forwardVariables) {
        if (forwardVariables.hasOwnProperty(attr)) future[attr] = forwardVariables[attr];
      }
    }
    $axure.setGlobalVariable('PageState', future.state);
    $axure.setGlobalVariable('PageHash', future.hash);
    history.items.push(future);
    window.openReplace = replace;
  };

  // Update selected variables in url
  //  updateVariables('*');
  //  updateVariables('a,b,c');
  //  updateVariables(['a', 'b', 'c']);
  $axure.ex.updateVariables = function (variables) {
    var params = updateHashParams(parseHashParams(location.href), variables);
    params.CSUM = 1;
    location.replace('#' + encodeHashParams(params));
  };

  // Called when page hash changes.
  function onHashChange(silent) {
    if (history.find(history.current.hash) < 0) {
      history.items.push(history.current);
    }
    if (!silent) $axure('@AxureEx.PageEnter').moveBy(0, 0, {});
  }

  // Called when hash changes.
  $(window).hashchange(function () {
    var params = parseHashParams(location.href);
    if (params.pagehash !== history.current.hash) {
      OnPageExit();
      history.previous = history.current;
      history.current = history.items[history.find(params.pagehash)];
      if (!history.current) history.current = history._new(params.pagestate, params.pagehash);
      if (false) {
        // Update all variables
        var variables = $axure.ex.getGlobalVariables('default');
        for (var i = 0; i < variables.length; i++) {
          var name = variables[i];
          var value = params[name.toLowerCase()];
          if (value !== undefined) $axure.setGlobalVariable(name, value);
          else $axure.setGlobalVariable(name, variables[name]);
        }
      } else {
        // Only update PageState variable
        $axure.setGlobalVariable('PageState', history.current.state);
      }
      onHashChange();
    }
  });

  // Initialize history
  $axure.setGlobalVariable('PageHash', '');
  history.items = [];
  history.session = {};
  history.local = {};
  history.previous = history._new('', '');
  history.unique = ~~(Math.random() * 1000);
  var stored = storage(false, 'history');
  if (typeof (stored) == 'object') {
    history.unique = stored.unique || history.unique;
    history.items = stored.items || history.items;
    history.session = stored.session || history.session;
    var index = history.find(stored.current);
    if (index >= 0) history.previous = history.items[index];
  }
  stored = storage(true, 'persistent');
  if (typeof (stored) == 'object') {
    history.local = stored.persistent || history.local;
  }

  var params = parseHashParams(location.href);
  history.current = history.items[history.find(params.pagehash)];
  if (!history.current) history.current = history._new(params.pagestate || 'Default', params.pagehash || unique());
  if ((history.current.hash != params.pagehash) || (history.current.state != params.pagestate)) {
    $axure.setGlobalVariable('PageState', history.current.state);
    params.pagestate = history.current.state;
    params.pagehash = history.current.hash;
    params.CSUM = 1;
    // IE gets into an infinit loop if this is done when the page is loaded
    setTimeout(function () {
      location.replace('#' + encodeHashParams(params));
    }, 0);
  }
  onHashChange(true);

  // setTimeout is a workaround to prevent IE call "beforeunload" when page is loaded
  setTimeout(function () {
    // Called before page is unloaded
    var eventName = 'beforeunload';
    if  (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) eventName = 'pagehide'; 
    $(window).on(eventName, function (event) { // debugger;
      OnPageExit();
      storage(false, 'history', {
        current: history.current.hash,
        previous: history.previous.hash,
        items: history.items,
        unique: history.unique,
        session: history.session
      });
      storage(true, 'persistent', {local: history.local});
    });                                          
  }, 0);

  // -------------------------------------------------------------------------------------------------------------------------------------
  // Done
  // -------------------------------------------------------------------------------------------------------------------------------------
  
  $axure('@AxureEx.Initialize').text('Success');

  // Custom CSS
  var css = $axure('@AxureEx.CSS').text();
  if (css) {
    if (console) console.log ('** Override @AxureEx.CSS (Remember to disable CSS in Webfont AxureEx.CSS) **');
    css = css.substring(css.indexOf("\n") + 1, css.lastIndexOf("\n"));
    css = css.trim().replace('\n', ' ').replace(/\s*([{};:,.!])\s*/g, '$1');
    if (css !== '') $('head').append('<style>' + css + '</style>');
  }

  // Custom Script
  execute('@AxureEx.Custom');
  window.AxureExCustom();

  // Custom Initialize
  $axure('@AxureEx.Initialize').moveBy(0, 0, {});

  // Refresh repeaters
  $axure(function (obj) {
    return obj.type == 'repeater';
  }).each(function (obj, id) {
    __refreshStart(id);
    __refreshEnd(id);
  });
};