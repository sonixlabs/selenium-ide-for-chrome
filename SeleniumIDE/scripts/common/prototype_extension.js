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

/**
 * Array Extension
 */

if (typeof Array.prototype.contains !== "function") {
  Array.prototype.contains = function(value) {
    for (var i in this) {
      if (this.hasOwnProperty(i) && this[i] === value) {
        return true;
      }
    }
    return false;
  }
}


/**
 * String Extension
 */

// Remove leading white space
if (typeof String.prototype.ltrim !== "function") {
  String.prototype.ltrim = function() {
    return this.replace(/^\s+/, "");
  };
}

// Remove trailing white space
if (typeof String.prototype.rtrim !== "function") {
  String.prototype.rtrim = function() {
    return this.replace(/\s+$/, "");
  };
}

// Remove leading and trailing white space
if (typeof String.prototype.trim !== "function") {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
  };
}
