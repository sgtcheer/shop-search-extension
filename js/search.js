/**
 *   param    responseText 		   the html in text format
 *   param	  shopNameSearched 	   the title of the shop you want to find
 *   return   If the specified shop is found, then return the location and 
 *			  nickname of the shop.
 */
function searchShopByText(responseText, shopNameSearched) {
	var shopIndex = -1;	
	var shopInfo = getShopInfo(responseText);
	var totalShopCount = shopInfo.length;
	for(var i = 0; i < totalShopCount; i++) {
		var title = getTitleString(shopInfo[i]);
		if(title.search(shopNameSearched) !== -1)
			break;		
	}
	if(i == totalShopCount) {
		shopIndex = -1;
		var nickname = null;
	}
	else {		
		var nickname = getNickString(shopInfo[i]);
		shopIndex = i+1;
	}
	var shop = {'location':shopIndex,
				'nickname':nickname};
	return shop;
}
/**
 *  search the shop using the Document object.
 *  param    shopNameSearched    the title of the shop you want to find
 *  return   If the specified shop is found, then return the location and 
 *			 nickname of the shop.
 */
function searchShopByHTML(shopNameSearched) {
	var listClass = 'list-info icon-5zhe';
	var shopClass = 'shop-name J_shop_name';
	var nickClass = 'shop-info-list';
	var nickElementIndex = 1;
	var titleElementIndex =0;
	var listInfo = document.getElementsByClassName(listClass);
	var shopCount = listInfo.length;	
	for(var i = 0; i < shopCount; i++) {
		var shopName = listInfo[i].getElementsByClassName(shopClass);		
		if(shopName[titleElementIndex].innerText.search(shopNameSearched) !== -1)
			break;
	}
	if(i == shopCount) {
		var shopIndex = -1;
		var nickname = null;
	}		
	else {
		var nickInfo = document.getElementsByClassName(nickClass)[i].childNodes;
		var nickname = nickInfo[nickElementIndex].innerText;		
		var shopIndex = i + 1;		
	}
	var shop = {'location':shopIndex,
				'nickname':nickname};
	return shop;
}
/**
 *	param	sValue	sValue is a key parameter of the URL which has
 *	 		relation with the page number of the current html page.
 *	return	the page number of the current html page is returned.
 */
function getCurrentPageNumber(sValue) {
	var pageNumber = sValue / 20 + 1;
	return pageNumber;
}
/**
 *	param	str is the string you want to match with. Note that the
 *			string may contain sign of '*' ,which denotes arbitrary
 *			sign with arbitrary length.  		
 *	return	the regular expression of the string is returned.
 */
function getRegularExpression(str) {
	var firstIndex = str.indexOf('*');
	var lastIndex = str.lastIndexOf('*');
	if(firstIndex !== -1)		
		str = str.substring(0 , firstIndex) + '.*' + str.substring(lastIndex + 1);	
	var regEx = new RegExp('^' + str + '$');
	return regEx;	
}
/**
 *	param	text is the reponse text of the http request.
 *	return	the information which is relative to the shop, including
 *			the title, nickname, and provcity of the shop.
 */
function getShopInfo(text) { 
	var shop = text.match(/uid[\s\S]*?provcity/g); 
	var shopInfo = new Array(); 
	for(var i = 0; i < shop.length; i++) { 
		var index = shop[i].lastIndexOf('title'); 
		shopInfo[i] = shop[i].substring(index);
	}
	return shopInfo;
 }
/**
 *	param	text is the string which contains the title of the shop		
 *	return	the title of the shop contained in the text string
 */
function getTitleString(text) {
	var stopOffset = -3;
	var startIndex = 8;
	var stopIndex = text.indexOf('nick')+stopOffset;
	var title = text.substring(startIndex,stopIndex);
	return title;
}
/**
 *	param	text is the string which contains the nickname of the shop		
 *	return	the nickname of the shop ccontained in the text string
 */
function getNickString(text) {
	var startOffset = 7;
	var stopOffset = -3;
	var startIndex = text.indexOf('nick')+startOffset;
	var stopIndex = text.indexOf('provcity')+stopOffset;
	var nick = text.substring(startIndex,stopIndex);
	return nick;	
}

// The main program
var shopNameSearched = window.prompt('请输入要搜索的店铺名！');
var shopNameSearched = getRegularExpression(shopNameSearched);
var isStop =false;
var totalPage = 10;// the maximum number of page that can be searched	
var queryUrl = window.location.search;	
var sIndex = queryUrl.lastIndexOf('s=');
var baseUrl = queryUrl.substring(0 , sIndex);
var url = queryUrl.substring(sIndex +2);
var sValueIndex = url.indexOf('&');	
if(sValueIndex === -1 ) {
	var sValue = parseInt(url);
	var isOffset = false;
}
else {
	var sValue = parseInt( url.substring(0 , sValueIndex ) );
	var offsetUrl = url.substring(sValueIndex);
	var isOffset = true;
}
var pageIndex = getCurrentPageNumber(sValue);
var shopInfo=searchShopByHTML(shopNameSearched);
var shopIndex = parseInt(shopInfo.location);
if( shopInfo.location === -1) {
	var msg = 'can not find the specified shop';	
}
else {	
	var msg = '第' + pageIndex + '页' + '\n' + 
			  '第' + shopIndex + '行' + '\n' + 
			  '掌柜名：' + shopInfo.nickname;
}
if(msg === 'can not find the specified shop') {	
	for(pageIndex += 1; !isStop && pageIndex <= totalPage; pageIndex++) {
		sValue += 20;
		if( isOffset === true )	{	
			var nextPageUrl= 'search' + baseUrl + 's=' + sValue + offsetUrl;
		}
		else {
			var nextPageUrl= 'search' + baseUrl + 's=' + sValue;
		}
		var request = new XMLHttpRequest();
		request.open('GET', nextPageUrl, false);
		request.send(null);
		var responseText = request.responseText;
		var shopInfo = searchShopByText(responseText, shopNameSearched);
		var shopIndex = parseInt(shopInfo.location);
		if(shopIndex > -1) {			
			isStop= true;
			/** You can replace the statement before with a "break". 
			 *  If you do this, you should put the following two
			 *  statements outside the for loop.
			 */			
			msg = '第' + getCurrentPageNumber(sValue) + '页' + '\n' + 
				  '第' + shopIndex + '行' + '\n' +
				  '掌柜名：' + shopInfo.nickname;					
		}
	}
}	
if(msg === 'can not find the specified shop') {	
	msg = '不存在与该店铺名对应的店铺';
}
alert(msg);
if(isStop === true) {
	window.location = nextPageUrl;
}
