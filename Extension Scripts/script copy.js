/*------------------------------*/
function getLinkForTarget(target)
{
    if (target.tagName === "BODY")
        return null;
    if (target.href)
        return target.href;
    if (target.parentNode)
        return getLinkForTarget(target.parentNode);
}
/*------------------------*/
function onAllNode(node)
{
    var a =  new Array();
    
    if (node.href)
        a.push(node.href);
    
    var list = node.childNodes;
    var i = 0;
    for (i=0;i<list.length;i++)
    {
        var nd = list.item(i);
        var b = null;
        b = this.onAllNode(nd);
        if (b!=null)
            a = a.concat(b);
    }
    if (a.length!=0)
        return a;
    else
        return null;
}

/*------------------------*/
function getSelectionLinks()
{
    var selection = window.getSelection();
    if (selection && selection.rangeCount > 0)
    {
        var ft = selection.getRangeAt(0);
        if (ft)
        {
            var st = ft.commonAncestorContainer;
            if (st)
            {
                var lin = onAllNode(st);
                return lin;
            }
        }
    }
    return null;
}
/*-------------------------------------------------*/
/*  Get cookie */
/*-------------------------------------------------*/
var getCookies = function() {
    if(document.cookie) {
        return encodeURIComponent(document.cookie);
    }else{
        return false;
    }
}
/*------------------------------*/
/*     escape array of URLs   */
/*------------------------------*/
function escapeURLArray(URLSs)
{
    var escapedURLs = "";
    var i = 0;
    for (i=0;i<URLSs.length;i++)
    {
        escapedURLs=escapedURLs+encodeURIComponent(URLSs[i]);
        if (i<URLSs.length-1)
            escapedURLs=escapedURLs+"||";
    }
    return escapedURLs;
}
/*------------------------------*/
/*     Handle to Context Menu   */
/*------------------------------*/
var handleContextMenu = function(event)
{
    lastRightClickedElement = event.target;
    var clickLink = getLinkForTarget(event.target);
    var selectedLinks = getSelectionLinks();
    
    var currentElement = event.target;
    var info={};
    if(selectedLinks != null)
    {
        var escapedURLs = escapeURLArray(selectedLinks);
        info["urls"] = encodeURIComponent(escapedURLs);
        info["urlsCount"] = selectedLinks.length;
    }
    if(clickLink != null)
    {
        info["clickLink"] = encodeURIComponent(clickLink);
    }
    URLs = new Array();
    var links =  document.links;
    for (var i=0;i<links.length;i++)
        URLs[i]=links[i].href;
    if(URLs.length>0)
    {
        var escapedURLs = escapeURLArray(URLs);
        info["allUrls"] = encodeURIComponent(escapedURLs);
        info["allUrlsCount"] = URLs.length;
    }
    
    info["referrer"] = document.location.href;
    info["cookie"] = getCookies();
    safari.extension.setContextMenuEventUserInfo(event,info);
}
document.addEventListener("contextmenu", handleContextMenu, false);

