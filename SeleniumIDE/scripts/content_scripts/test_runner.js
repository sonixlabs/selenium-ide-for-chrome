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


var TestRunner = function() {
  var MAX_REPEAT_COUNT = 2;
  var self = this;
  self.addTestListeners = function (){
    chrome.extension.onRequest.addListener(
      function(req, sender, sendResponse) {
        if (req.to === "test_runner") {
          switch (req.method) {
          case "runTest":
            self.runTest(req.base_url, req.command_row, 0, sendResponse);
            break;
          case "reloadPage":
            location.reload();
          default:
          } 
        }
    });
  };

  self.getTargetJqueyObj = function(row) {
    var $obj;
    switch (row.command) {
    case "select":
    case "addSelection":
    case "removeSelection":
      switch (row.target.type) {
      case "id":
        $obj = $("option:contains(" + row.value + ")", "#" + row.target.value);
        break;
      case "name":
        $obj = $("option:contains(" + row.value + ")", "[name=" + row.target.value + "]");
        break;
      default:
        alert("targetType not found:" + row.target.type);
      }
      break;

    default:
      switch (row.target.type) {
      case "id":
        $obj = $("#" + row.target.value);
        break;
      case "linkText":
        $obj = $("a:contains('" + row.target.value +  "')");
        break;
      case "name":
        $obj = $("[name=" + row.target.value + "]");
        break;
      default:
      }
    }

    console.log("getTargetJqueryObj");
    console.dir($obj);
    return $obj;
  }

  self.runTest = function(base_url, row, repeat_count, sendResponse) {
    var delay_time = 0;
    var message = "[info] Executing: | " + row.command + " | " + row.target.type + "=" + row.target.value + " | " + row.value + " |";
    switch (row.command) {

    // Command does not have a target object
    case "open":
      var url = base_url + row.value;
      if (url.substr(-2, 2) === "//") {
        url = url.substr(0, url.length - 1)
      }
      sendResponse({result: "success", row_no: row.row_no, delay_time: 2000, message: message});
      // If you don't use setTimeout(), there is a possibility that fail to sendResponse(). 
      return setTimeout(function() {document.location = url}, 100);

    // Command has a target object
    default:
      var targetObj = self.getTargetJqueyObj(row);

      if (targetObj === undefined || targetObj.length == 0) {
        if (repeat_count < MAX_REPEAT_COUNT) {
          repeat_count += 1;
          return setTimeout(function() {self.runTest(base_url, row, repeat_count, sendResponse)}, 1000);
        } else {
          message = "[error] " + row.target.type + "=" + row.target.value + " not found";
          return sendResponse({result: "failed", row_no: row.row_no, message: message});
        }
      }

      sendResponse({result: "success", row_no: row.row_no, delay_time: 500, message: message});
      // TODO implement error handle. and if error occurd, response error message.
      switch (row.command) {
      case "click":
        // call click() of DOM-Object instead jQuery-Object.
        targetObj[0].click();
        break;

      case "select":
      case "addSelection":
        targetObj.attr("selected", "selected");
        break;

      case "removeSelection":
        targetObj.removeAttr("selected");
        break;

      case "type":
        targetObj.val(row.value);
        break;

      default:
        alert("command not found:" + row.command);
      }
      //sendResponse({result: "success", row_no: row.row_no, delay_time: 500, message: message});
    }
  };
}
