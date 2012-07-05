/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 *  @author Kazuhiro Yamada (yamadakazu45@gmail.com)
 */

var Config = {
   current_useragent: {name:'default', value: '-'}
  ,last_export_format: ""
  ,last_export_class_name: "Test1"
  ,last_chrome_driver_file_path: ""
  ,saved_test_cases: [] 
  ,useragent_list: [
     {name: 'default', value: '-'}
    ,{name: 'android', value: 'Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'}
    ,{name: 'iphone',  value: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5'}
  ]
};

if (db.get('Config')) {
  Config = db.get('Config');
} else {
  db.set('Config', Config);
}

var initialize = function() {
  setBatch();
  // click on the chrome-extension icon
  chrome.browserAction.onClicked.addListener(openIDE);
};

var saveConfig = function() {
  db.set('Config', Config);
};

var openIDE = function(win) {
  console.log("init");
  var features = "titlebar=no,menubar=no,location=no," +
    "resizable=no,scrollbars=no,status=no," + 
    "width=553, height=742,";
  window.open("ide.html", "SeWinID", features);
};

var setBatch = function() {
  var current_ua = Config.current_useragent.name;
  if (current_ua === "default") {
    chrome.browserAction.setBadgeText({text: ''});
  } else {
    chrome.browserAction.setBadgeText({text: Config.current_useragent.name});
  }
};

var saveTestCase = function(test_case) {
  if (Config.saved_test_cases === undefined) {
    Config.saved_test_cases = [];
  }
  Config.saved_test_cases.push(test_case);
  saveConfig();
};

var deleteTestCase = function(test_case_id) {
  Config.saved_test_cases.splice(test_case_id, 1);
  saveConfig();
};

var changeExportFormat = function(format) {
  Config.last_export_format = format;
  saveConfig();
};

var changeExportClassName = function(class_name) {
  Config.last_export_class_name = class_name;
  saveConfig();
};

var changeChromeDriverFilePath = function(chrome_driver_file_path) {
  Config.last_chrome_driver_file_path = chrome_driver_file_path;
  saveConfig();
};

/* 
 * User-Agent Switcher 
 */

var changeUserAgent = function(name, value) {
  Config.current_useragent = {name: name, value: value};
  setBatch(name);
  saveConfig();
};

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (Config.current_useragent.value != '-') {
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'User-Agent') {
          details.requestHeaders[i].value = Config.current_useragent.value; 
          console.log("ua:" + details.requestHeaders[i].value);
          break;
        }
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

initialize();
