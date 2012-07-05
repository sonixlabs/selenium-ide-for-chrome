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
 * Object used to record action on the webapp
 */
var Recorder = function() {
  self = this;
  this.knownSelects = new Array();
  this.knownSelectsName = new Array();
  this.pre_selected_values = [];

  this.addAllListeners = function() {
    this.addClickListeners()
        .addInputListeners()
        .addSelectListeners();
  }

  /**
   * googleの検索画面等のように、ページ表示後にajaxで検索結果等を取得するページがあるので、
   * 一定時間後にListenerをセットする。
   */
  this.addAllListenersWithLatency = function(latency) {
    setTimeout(function() {self.addAllListeners()}, latency);
  }

  /**
   * Used to add click listener on clickable objects
   */
  this.addClickListeners = function() {
    var clickables = Options.getClickables();
    $.each(clickables, function(index, value) {
      $(value).each(function(index) {
        $(this).unbind('click');
        $(this).bind('click', function() {
          chrome.extension.sendRequest({type: "action", command: "click", target: {locators: Utils.getLocators(this)}, value:null}, function(response) {});
          self.addAllListenersWithLatency(500);
        })
      });
    });
    return this;
  }

  /**
   * Used to add input listener on seizable objects
   */
  this.addInputListeners = function() {
    var inputables = Options.getInputables();
    $.each(inputables, function(index, value) {
      $(value).each(function(index) {
        $(this).unbind('change');
        $(this).bind('change', function() {
          chrome.extension.sendRequest({type: "action", command: "type", target: {locators: Utils.getLocators(this)}, value: $(this).val()}, function(response) {});
          self.addAllListenersWithLatency(500);
        })
      });
    });
    return this;
  }

  /**
   * Used to add select listener on single and multiple select objects
   */
  this.addSelectListeners = function () {
  
    /**
     * Listener for single select object
     */
    $("select:not([multiple])").each(function(index) {
      $(this).unbind('change');
      $(this).bind('change', function() {
        var currentSelect = this;
        $("option:selected", this).each(function(){
          var target = {locators: Utils.getLocators(currentSelect)};
          chrome.extension.sendRequest({type: "action", command: "select", target: target, value: $(this).text()}, function(response) {});
        });
        self.addAllListeners();
      });
    });

    /**
     * Listener for multiple select object
     */
    $("select:[multiple]").each(function(index) {
      $(this).unbind('focus');
      $(this).bind('focus', function() {
        self.setPreSelectedValue(event.target);
      });
    });

    $("select:[multiple]").each(function(index) {
      $(this).unbind('change');
      $(this).bind('change', function() {
        var currentSelect = this;
        $("option", this).each(function(){
          if (this.selected && !self.pre_selected_values.contains(this.value)) {
            // add selection
            var target = {locators: Utils.getLocators(currentSelect)};
            chrome.extension.sendRequest({type: "action", command: "addSelection",    target: target, value: this.value}, function(response) {});
          } else if (!this.selected && self.pre_selected_values.contains(this.value)) {
            // remove selection
            var target = {locators: Utils.getLocators(currentSelect)};
            chrome.extension.sendRequest({type: "action", command: "removeSelection", target: target, value: this.value}, function(response) {});
          }
        });
        self.setPreSelectedValue(event.target);
        self.addAllListeners();
      });
    });
  }

  this.setPreSelectedValue = function($select) {
    this.pre_selected_values = [];
    $("option:selected", $select).each(function(){
      self.pre_selected_values.push(this.value);
    });
    return this;
  }

}
