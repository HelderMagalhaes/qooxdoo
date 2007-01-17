/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * A data cell renderer for a simple tree row
 */
qx.OO.defineClass("qx.ui.treevirtual.SimpleTreeDataCellRenderer",
                  qx.ui.table.AbstractDataCellRenderer,
function()
{
  qx.ui.table.AbstractDataCellRenderer.call(this);

  // Base URL used for indent images
  var Am = qx.manager.object.AliasManager;
  this.WIDGET_TREE_URI = Am.getInstance().resolvePath("widget/tree/");
  this.STATIC_IMAGE_URI = Am.getInstance().resolvePath("static/image/")
});


qx.OO.addProperty({ name : "useTreeLines",
                    type : "boolean",
                    defaultValue : true,
                    getAlias : "useTreeLines"
                  });

qx.OO.addProperty({ name : "alwaysShowPlusMinusSymbol",
                    type : "boolean",
                    defaultValue : false
                  });



// overridden
qx.Proto._getCellStyle = function(cellInfo)
{
  return qx.ui.treevirtual.SimpleTreeDataCellRenderer.MAIN_DIV_STYLE;
};


// overridden
qx.Proto._getContentHtml = function(cellInfo)
{
  var html = "";
  var node = cellInfo.value;
  var imageUrl;
  var _this = this;
  var Stdcr = qx.ui.treevirtual.SimpleTreeDataCellRenderer;

  function addImage(urlAndToolTip)
  {
    var html = Stdcr.IMG_START;
    var Am = qx.manager.object.AliasManager;

    if (qx.core.Client.getInstance().isMshtml() &&
        /\.png$/i.test(urlAndToolTip.url))
    {
      html +=
        this.STATIC_IMAGE_URI + "blank.gif" +
        '" style="filter:' +
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(" +
        "  src='" + urlAndToolTip.url + "',sizingMethod='scale')";
    }
    else
    {
      var imageUrl = Am.getInstance().resolvePath(urlAndToolTip.url);
      html += imageUrl + '" style="';
    }

    if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight)
    {
      html +=
        ';width:' + urlAndToolTip.imageWidth + 'px' +
        ';height:' + urlAndToolTip.imageHeight + 'px';
    }

    var tooltip = urlAndToolTip.tooltip;
    if (tooltip != null)
    {
      html += Stdcr.IMG_TITLE_START + tooltip;
    }
    html += Stdcr.IMG_END;

    return html;
  }

  // Generate the indentation
  var bUseTreeLines = this.getUseTreeLines();
  for (var i = 0; i < node.level; i++)
  {
    imageUrl = this._getIndentSymbol(i, node, bUseTreeLines);
    html += addImage({ url:imageUrl, imageWidth:19, imageHeight:16 });
  }

  // Add the node's icon
  imageUrl = (node.bSelected ? node.iconSelected : node.icon);
  if (! imageUrl)
  {
    if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF)
    {
      imageUrl = (node.bSelected
                  ? "icon/16/file-open.png"
                  : "icon/16/file-new.png");
    }
    else
    {
      imageUrl = (node.bSelected
                  ? "icon/16/folder_open.png"
                  : "icon/16/folder.png");
    }
  }
  html += addImage({ url:imageUrl });

  // Add the node's label.  We calculate the "left" property with: each tree
  // line icon is 19 pixels wide; the folder icon is 16 pixels wide, there are
  // two pixels of padding at the left, and we want 2 pixels between the
  // folder icon and the label
  html +=
    '<div style="position:absolute;' +
    'left:' + ((node.level * 19) + 16 + 2 + 2) + ';' +
    'top:0;">' +
    node.labelHtml +
    '</div>';

  return html;
};


qx.Proto._getIndentSymbol = function(column, node, bUseTreeLines)
{
  // If we're not on the final column...
  if (column < node.level - 1)
  {
    // then return either a line or a blank icon, depending on bUseTreeLines
    return (bUseTreeLines
            ? this.WIDGET_TREE_URI + "line.gif"
            : this.STATIC_IMAGE_URI + "blank.gif");
  }

  // Is this a branch node?
  if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH)
  {
    // Determine if this node has any children
    var child = null;
    for (child in node.children)
    {
      // If we find even one, we're done here.
      break;
    }

    // Does this node have any children, or do we always want the plus/minus
    // symbol to be shown?
    if (child !== null || this.getAlwaysShowPlusMinusSymbol())
    {
      // Yup.  If this is the last child of its parent...
      if (node.bLastChild)
      {
        // then return an ending plus or minus, or blank if node.expanded so
        // indicates.
        return (node.expanded === null
                ? "blank"
                : (node.expanded
                   ? this.WIDGET_TREE_URI + "end_minus.gif"
                   : this.WIDGET_TREE_URI + "end_plus.gif"));
      }

      // Otherwise, return a crossing plus or minus, or a blank if
      // node.expanded so indicates.
      return (node.expanded === null
              ? this.STATIC_IMAGE_URI + "blank.gif"
              : (node.expanded
                 ? this.WIDGET_TREE_URI + "cross_minus.gif"
                 : this.WIDGET_TREE_URI + "cross_plus.gif"));
    }
  }

  // This node does not have any children.  Return an end or cross, if we're
  // using tree lines.
  if (bUseTreeLines)
  {
    // If this is a last child, return and ending line; otherwise cross.
    return (node.bLastChild
            ? this.WIDGET_TREE_URI + "end.gif"
            : this.WIDGET_TREE_URI + "cross.gif");
  }

  return this.STATIC_IMAGE_URI + "blank.gif";
}


// overridden
qx.Proto._createCellStyle_array_join = function(cellInfo, htmlArr)
{
  throw new Error("USE_ARRAY_JOIN not supported");
};



qx.Proto._createContentHtml_array_join = function(cellInfo, htmlArr)
{
  throw new Error("USE_ARRAY_JOIN not supported");
};

qx.Class.MAIN_DIV_STYLE =
  ';overflow:hidden;white-space:nowrap;border-right:1px solid #eeeeee;' +
  'padding-left:2px;padding-right:2px;cursor:default' +
  (qx.core.Client.getInstance().isMshtml() ? '' : ';-moz-user-select:none;');

qx.Class.IMG_START = '<img src="';
qx.Class.IMG_END = '"/>';
qx.Class.IMG_TITLE_START = '" title="';

