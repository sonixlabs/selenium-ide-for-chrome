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

var CodeGenerator = function() {
  self = this;

  this._createFormatter = function(format, params) {
    var formatter;
    switch (format) {
    case SE.FORMAT_JUNIT4_WEB_DRIVER:
      return new WebDriverFormatter(params.class_name, params.base_url, params.chrome_driver_file_path);
    case SE.FORMAT_JUNIT4_ANDROID_DRIVER_FOR_SCIROCCO_CLOUD:
      return new AndroidDriverForSciroccoCloudFormatter(params.class_name, params.base_url);
    default:
      alert("format " + format + " don't defined in code_generator.js");
    }
  },

  this.generate = function(command_list, format, params) {
    var formatter = this._createFormatter(format, params);
    var code = ""
      + formatter.header()
      + formatter.testcase(command_list)
      + formatter.footer()
    return code;
  }
}

