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
 *  @author Jeremy Herault (jeremy.herault AT gmail.com)
 *  @author Kazuhiro Yamada (yamadakazu45@gmail.com)
 */

/**
 * Utils object
 */
Utils = {};

/**
 * Retrieve all locators of a given DOM element
 * @param element - the DOM element
 */
Utils.getLocators = function(element) {
  var cssSelector = Utils.getCssLocator(element);
  var id = element.getAttribute("id") != undefined ? element.getAttribute("id") : null;
  // To respond to if they contain a newline in <a> tags text.
  var linkText = element.nodeName.toLowerCase() == "a" ? $(element).text().trim().split("\n")[0] : null;
  var name = element.getAttribute("name") != undefined ? element.getAttribute("name") : null;
  var xpath = Utils.getXPathLocator(element);

  var locators = new Array();

  if (id != null) {
    locators.push({type:"id", value:id});
  }

  if (name != null) {
    locators.push({type:"name", value:name});
  }

  locators.push({type:"cssSelector", value:cssSelector});
  // TODO
  //locators.push({type:"xpath", value:xpath});
  if (linkText != null && linkText !== "") {
    locators.push({type:"linkText", value:linkText});
  }
  return locators;
}

/**
 * Retrieve all locators for a given option element
 * @param element - the option element
 */
Utils.getOptionLocators = function(element) {
  var locators = new Array();
  locators.push({type:"Index", value:element.index});
  locators.push({type:"Value", value:element.value});
  locators.push({type:"VisibleText", value:$(element).val()});
  return locators;
}

/**
 * Used to append more than one child at the time to an element
 * @param element - the container element
 * @param children - the children of the element that have to be added
 */
Utils.appendChildren = function(element, children) {
  for (var i = 0 ; i < children.length ; i++) {
    element.appendChild(children[i]);
  }
}


/**
 * copy from selenium ide source code: {@link http://code.google.com/p/selenium/source/browse/trunk/ide/main/src/content/locatorBuilders.js}
 * @param current - a DOM element
 */
Utils.getNodeNbr = function(current) {
  var childNodes = current.parentNode.childNodes;
  var total = 0;
  var index = -1;
  for (var i = 0; i < childNodes.length; i++) {
    var child = childNodes[i];
    if (child.nodeName == current.nodeName) {
      if (child == current) {
        index = total;
      }
      total++;
    }
  }
  return index;
}

/**
 * copy from selenium ide source code: {@link http://code.google.com/p/selenium/source/browse/trunk/ide/main/src/content/locatorBuilders.js}
 * @param current - a DOM element
 */
Utils.getCSSSubPath = function(e) {
  var css_attributes = ['id', 'name', 'class', 'type', 'alt', 'title', 'value'];
  for (var i = 0; i < css_attributes.length; i++) {
    var attr = css_attributes[i];
    var value = e.getAttribute(attr);
    if (value) {
      return attr == 'id' ?
        '#' + value
        : e.nodeName.toLowerCase() +
        (
          attr == "class" ?
            '.' + value.replace(/ /g, ".").replace(/\.\./g, ".")
            : '[' + attr + '="' + value + '"]'
          );
    }
  }

  return e.nodeName.toLowerCase() + (this.getNodeNbr(e) ? ':nth-of-type(' + this.getNodeNbr(e) + ')' : "");
}

/**
 * copy from selenium ide source code: {@link http://code.google.com/p/selenium/source/browse/trunk/ide/main/src/content/locatorBuilders.js}
 * @param current - a DOM element
 */
Utils.getCssLocator = function(e) {
  var current = e;
  var sub_path = this.getCSSSubPath(e);

  while ($(sub_path).get(0) != e && current.nodeName.toLowerCase() != 'html') {
    sub_path = this.getCSSSubPath(current.parentNode) + ' > ' + sub_path;
    current = current.parentNode;
  }
  return sub_path;
}

/**
 * Function that generate the xpath of a given element
 * @param e - a DOM element
 */
Utils.getXPathLocator = function(e) {
  var xpath = "";
  while (e && e.nodeType == 1) {
    var index = $(e.parentNode).children(e.tagName).index(e) + 1;
    index > 1 ? (index = '[' + index + ']') : (index = '');
    xpath = "/" + e.tagName.toLowerCase() + index + xpath;
    e = e.parentNode;
  }
  return xpath;
}


/**
 * -- Sample --
 * var Parent = function(){}
 * var Child = function(){}
 * Utils.inherit(Child, Parent);
 */
Utils.inherit = (function () {
  var F = function () {};
  return function (C, P) {
    F.prototype = P.prototype;
    C.prototype = new F();
    //C.uber = P.prototype;
    C.prototype.uber = P.prototype;
    C.prototype.constructor = C;
  }
}());
