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

var FormatterBase = function(class_name, base_url) {
  this.class_name = class_name || "Test1";
  this.base_url = base_url || "";
};

FormatterBase.prototype.header = function() {
  return "mock";
};

FormatterBase.prototype.footer = function() {
  return "mock";
};

FormatterBase.prototype.testcase_header = function() {
  return "mock";
};

FormatterBase.prototype.testcase_footer = function() {
  return "mock";
};

FormatterBase.prototype.testcase = function(command_list) {
  var testcase = this.testcase_header();
  for (var i = 0, length = command_list.length; i < length; i++) {
    testcase += this.lineOfTestCase(command_list[i]);
  }
  testcase += this.testcase_footer();
  return testcase;
};

FormatterBase.prototype.lineOfTestCase = function(row) {
  switch (row.command) {
  case "open":
    return this.open(row)
  case "click":
    return this.click(row);
  case "type":
    return this.type(row);
  case "sleep":
    return this.sleep(row);
  case "screenshot":
    return this.screenshot(row);
  default:
    alert(row.command + " not defined in lineOfTestCase");
  }
};

FormatterBase.prototype.findElement = function(target) {
  return "mock";
};

FormatterBase.prototype.open = function(row) {
  return "mock";
};

FormatterBase.prototype.click = function(row) {
  return "mock";
};

FormatterBase.prototype.type = function(row) {
  return "mock";
};

FormatterBase.prototype.sleep = function(row) {
  return "mock";
};

FormatterBase.prototype.screenshot = function(row) {
  return "mock";
};

FormatterBase.prototype.indents = function(num) {
  var indents = "";
  for(var i = 0; i < num; i++){
    indents += "  ";
  }
  return indents;
};

