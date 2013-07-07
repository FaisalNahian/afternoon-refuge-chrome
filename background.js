if (!localStorage['first_run']) {
  localStorage['first_run'] = true;
  chrome.tabs.create({
    url : chrome.extension.getURL('options.html')
  });
}
if (!localStorage['username'])
  localStorage['username'] = '';
if (!localStorage['password'])
  localStorage['password'] = '';

chrome.contextMenus.create({
  "type" : "normal",
  "title" : "Save this job for later..",
  "onclick" : function (info, tab) {
    chrome.tabs.sendMessage(tab.id, {
      "show" : true
    })
  }
});
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, {
    "show" : true
  })
});
chrome.extension.onMessage.addListener(
  function (resonseMsg, sender, sendResponse) {
  if (resonseMsg.type == 'openTab') {
    chrome.tabs.create({
      url : resonseMsg.tab
    });
  }
  if (resonseMsg.type == 'openOptions') {
    chrome.tabs.create({
      url : chrome.extension.getURL('options.html')
    });
  }
  if (resonseMsg.type == 'getLogins') {
    if (localStorage['username'] == '' || localStorage['username'] == undefined || localStorage['password'] == '' || localStorage['password'] == undefined ) {
      sendResponse({
        haveLogins : false,
        User : localStorage['username'],
        Pass : localStorage['password']
      });
    } else
      sendResponse({
        haveLogins : true,
        User : localStorage['username'],
        Pass : localStorage['password']
      });
  }
  if (resonseMsg.type == 'saveLogins') {
    localStorage['username'] = resonseMsg.username;
    localStorage['password'] = resonseMsg.password;
    sendResponse({
      haveLogins : true,
      User : localStorage['username'],
      Pass : localStorage['password']
    });
  }
});
