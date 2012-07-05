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

var KEYCODE_ENTER = 13;

$(function(){
  window.IDEView = Backbone.View.extend({
    el: "body",
    $selectedInputRow: null,
    preSelectedTime: null,
  
    events: { 
       "click #add_new_input"                 : "addInputRow"
      ,"click #rec"                           : "record"
      ,"click #run"                           : "toggleRun"
      ,"click #initialize_test"               : "initialize_test"
      ,"click .img-delete"                    : "deleteInputRow"
      ,"click tr.input-row"                   : "selectInputRow"
      ,"click .open-save-test-case-dialog"    : "openSaveTestCaseDialog"
      ,"click .open-load-test-case-dialog"    : "openLoadTestCaseDialog"
      ,"click .open-export-test-case-dialog"  : "openExportTestCaseDialog"
      ,"click .load-test-case"                : "loadTestCase"
      ,"click .delete-test-case"              : "deleteTestCase"
      ,"change #command"                      : "changeCommand"
      ,"change #target_type"                  : "changeTargetType"
      ,"change #user_agent"                   : "changeUserAgent"
      ,"change #export_format"                : "changeExportFormat"
      ,"blur #target_value"                   : "updateSelectedInputRow"
      ,"blur #value"                          : "updateSelectedInputRow"
      ,"blur #export_class_name"              : "changeExportClassName"
      ,"blur #chrome_driver_file_path"        : "changeChromeDriverFilePath"
      ,"keypress #value"                      : "updateSelectedInputRowWithLatency"
      ,"keypress #target_value"               : "updateSelectedInputRowWithLatency"
      ,"keypress #export_class_name"          : "changeExportClassName"
      ,"keypress #chrome_driver_file_path"    : "changeChromeDriverFilePath"
      ,"mousedown #btn_key_back"              : "keyBackMouseDown"
      ,"mousedown #btn_key_home"              : "keyHomeMouseDown"
      ,"mousedown #btn_key_menu"              : "keyMenuMouseDown"
    },
  
    initialize: function() {
      IDEViewInstance = this;
      on_rec = true;
      test_running = false;
      this.getTestTargetTab(this.setBaseUrl, this);
      this.initCommandSelectBox();
      this.initUserAgentSelectBox();
      $("ul.sf-menu").superfish(); 
    },

    loadTestCase: function() {
      var command_list_html = this.getConfig().command_list;
      if (command_list_html !== undefined && command_list_html !== "") {
        $("#input_list").html(command_list_html);
      }
    },



    /**
     * Util
     */

    getBackground: function() {
      return chrome.extension.getBackgroundPage();
    },

    getConfig: function() {
      return this.getBackground().Config;
    },

    getTestTargetTab: function(callback, callback_obj) {
      // get selected tab in the window other than IDE-window
      chrome.windows.getCurrent({populate: true}, function(cur_win) {
        chrome.windows.getAll({populate: true}, function(wins) {
          for (wi in wins) {
            if (cur_win != wins[wi]) {
              chrome.tabs.getSelected(wins[wi].id, function(tab) {
                callback.call(callback_obj, tab);
              });
              return;
            }
          }
          alert("The test-target-tab could not be found");
        });
      });
    },


    /**
     * Command select-box events
     */

    initCommandSelectBox: function() {
      var commands = [
         '-'
        ,'addSelection'
        ,'click'
        ,'open'
        ,'removeSelection'
        //,'screenshot'
        ,'select'
        //,'sleep'
        ,'type'
        //,'rotate'
      ];
      var $select = $("#command");
      $select.empty();
      for (var i = 0, length = commands.length; i < length; i++) {
        var $option = $('<option value="' + commands[i] + '">' + commands[i] + '</option>');
        $select.append($option);
      }
    },


    /**
     * Export testcase events
     */

    initExportFormatSelectBox: function() {
      var formats = [
         {name: 'JUnit 4 (WebDriver)', value: SE.FORMAT_JUNIT4_WEB_DRIVER}
        ,{name: 'JUnit 4 (AndroidDriver for SciroccoCloud)', value: SE.FORMAT_JUNIT4_ANDROID_DRIVER_FOR_SCIROCCO_CLOUD}
      ];

      var current_format = this.getConfig().current_export_format;
      var $select = $("#export_format");
      $select.empty();
      for (var i = 0, length = formats.length; i < length; i++) {
        var $option = $('<option value="' + formats[i].value + '">' + formats[i].name + '</option>');
        if (formats[i].value === current_format) {
          $option.attr('selected', 'selected');
        }
        $select.append($option);
      }
    },

    setExportTestCaseForm: function() {
      var format_val = $('option:selected', "#export_format").val();
      if (format_val === SE.FORMAT_JUNIT4_WEB_DRIVER) {
        $(".chrome-driver-format-only").show();
      } else {
        $(".chrome-driver-format-only").hide();
      }
    },

    changeExportFormat: function(ev) {
      var format_val = $('option:selected', "#export_format").val();
      this.getBackground().changeExportFormat(format_val);
      this.setTestCode();
      this.setExportTestCaseForm();
    },

    changeExportClassName: function(ev) {
      var self = this;
      setTimeout(function() { 
        self.getBackground().changeExportClassName($("#export_class_name").val());
      }, 50);
      this.setTestCodeWithLatency();
    },

    changeChromeDriverFilePath: function(ev) {
      var self = this;
      setTimeout(function() { 
        self.getBackground().changeChromeDriverFilePath($("#chrome_driver_file_path").val());
      }, 50);
      this.setTestCodeWithLatency();
    },

    setTestCodeWithLatency: function(ev) {
      var self = this;
      setTimeout(function() { self.setTestCode(); }, 50);
    },

    setTestCode: function() {
      var format = $('option:selected', "#export_format").val();
      if (format !== "") {
        var code_generator = new CodeGenerator();
        var code = code_generator.generate(this.getCommandList(), format, {
           class_name: $("#export_class_name").val()
          ,base_url: $("#base_url").val()
          ,chrome_driver_file_path: $("#chrome_driver_file_path").val()
        });
        $("#testcode").text(code);
      }
    },

    openSaveTestCaseDialog: function(ev) {
      var self = this;
      $("#dialog_save_test_case").dialog({
        modal: true,
        height: 180,
        width: 300,
        buttons: {
          Save: function() {
            self.getBackground().saveTestCase({
               name: $("#test_case_name").val()
              ,base_url: $("#base_url").val()
              ,input_list_html: $("#input_list").html()
            });
            $(this).dialog("close");
          },
          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },

    updateSavedTestCases: function() {
      var saved_test_cases = this.getConfig().saved_test_cases || [];
      var $tbody = $("#test_cases tbody");
      $tbody.empty();
      for (var i = 0, length = saved_test_cases.length; i < length; i++) {
        var $tr = $("<tr/>").attr("test_case_id", i);
        $tr.append($("<td><a href='#' class='load-test-case'>" + saved_test_cases[i].name + "</a></td>"));
        $tr.append($("<td/>").text(saved_test_cases[i].base_url));
        $tr.append($("<td><input class='delete-test-case' type='image' src='/images/icons/delete.png'/></td>"));
        $tbody.append($tr);
      }
    },

    openLoadTestCaseDialog: function(ev) {
      this.updateSavedTestCases();
      $("#dialog_load_test_case").dialog({
        modal: true,
        height: 600,
        width: 500,
        buttons: {
          Cancel: function() {
            $(this).dialog( "close" );
          }
        }
      });
    },

    loadTestCase: function(ev) {
      var test_case_id = parseInt($(ev.target).closest('tr').attr("test_case_id"));
      var test_case = this.getConfig().saved_test_cases[test_case_id];
      $("#base_url").val(test_case.base_url);
      $("#input_list").html(test_case.input_list_html)
      $("#dialog_load_test_case").dialog("close");
    },

    deleteTestCase: function(ev) {
      var test_case_id = parseInt($(ev.target).closest('tr').attr("test_case_id"));
      this.getBackground().deleteTestCase(test_case_id);
      this.updateSavedTestCases();
    },

    openExportTestCaseDialog: function(ev) {
      var self = this;
      this.initExportFormatSelectBox();
      $("#export_class_name").val(this.getConfig().last_export_class_name);
      $("#chrome_driver_file_path").val(this.getConfig().last_chrome_driver_file_path);
      this.setExportTestCaseForm();
      this.setTestCode();
      $("#dialog_export_test_case").dialog({
        modal: true,
        height: 600,
        width: 500,
        buttons: {
          Download: function() {
            var bb = new WebKitBlobBuilder();
            bb.append($("#testcode").text());
            saveAs(bb.getBlob("text/plain;charset=utf-8"), $("#export_class_name").val() + ".java");
            $(this).dialog("close");
          },
          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    },


    /**
     * UserAgent events
     */

    initUserAgentSelectBox: function() {
      var config = this.getConfig();
      var $select = $("#user_agent");
      $select.empty();

      for (var i in config.useragent_list) {
        var $option = $('<option value="' + config.useragent_list[i].value + '">' + config.useragent_list[i].name + '</option>');
        if (config.useragent_list[i].value === config.current_useragent.value) {
          $option.attr('selected', 'selected');
        }
        $select.append($option);
      }
    },

    changeUserAgent: function(ev) {
      var $selected_option = $('option:selected', ev.target);
      this.getBackground().changeUserAgent($selected_option.text(), $selected_option.val());
      this.getTestTargetTab(this.reloadPage, this);
    },


    /**
     * Record events
     */

    changeToRecMode: function() {
      on_rec = true;
      $("#rec").attr("src", "/images/icons/rec.png");
      $("#rec").attr("title", "Now Recording. Click to Stop Recording");
      $(".hardkey_icon").addClass("on_rec")
    },
  
    changeToNotRecMode: function() {
      on_rec = false;
      $("#rec").attr("src", "/images/icons/rec_disabled.png");
      $("#rec").attr("title", "Click to Record");
      $(".hardkey_icon").removeClass("on_rec")
    },
  
    record: function() {
      if (on_rec == false) {
        this.changeToRecMode();
      } else {
        this.changeToNotRecMode();
      }
    },


    /**
     * Test run events
     */

    run: function() {
      $("#log_table").empty();
      this.changeToRunningMode();
      this.changeToNotRecMode();
      this.getTestTargetTab(this.runTest, this);
    },

    toggleRun: function() {
      if (test_running == false) {
        this.run();
      } else {
        this.pause();
      }
    },
  
    runTest: function(target_tab) {
      var command_list = this.getCommandList();
      $(".input-row").removeClass("testing-row test-passed-row test-failed-row");
      $(".input-row").eq(0).addClass("testing-row");
      this.runCommandListInOrder(target_tab, command_list);
    },

    runCommandListInOrder: function(target_tab, command_list) {
      var self = this;
      //var command_row = command_list.shift();
      var command_row = command_list[0];

      chrome.tabs.sendRequest(target_tab.id, {to: "test_runner", method: "runTest", base_url: $("#base_url").val(), command_row: command_row}, function(response) {
        console.log("runCommandList");
        console.dir(response);
        if (response === undefined) {
          console.log("retry because of respons is undefined");
          return self.runCommandListInOrder(target_tab, command_list);
        }

        command_list.shift();

        self.addLog(response);

        var $target_row = $(".input-row").eq(response.row_no);
        $target_row.removeClass("testing-row");

        if (response.result === "success") {
          $target_row.addClass("test-passed-row");
        } else {
          $target_row.addClass("test-failed-row");
          self.changeToRecMode();
          self.changeToNotRunningMode();
          return;
        }
        if (command_list.length === 0) {
          setTimeout(function() { 
            self.changeToRecMode();
            self.changeToNotRunningMode();
          }, 1000);
        } else {
          $(".input-row").eq(command_row.row_no + 1).addClass("testing-row");
          setTimeout(function() { self.runCommandListInOrder(target_tab, command_list); }, response.delay_time);
          //setTimeout(function() {self.runCommandListInOrder(target_tab, command_list); }, 10);
        }
      });
      setTimeout(function() {self.checkRunTimeout(target_tab, command_list, command_row)}, 4000);
    },

    checkRunTimeout: function(target_tab, command_list, command_row) {
      var $target_row = $(".input-row").eq(command_row.row_no);
      if ($target_row.hasClass("testing-row")) {
        console.log("retry because of timeout");
        this.runCommandListInOrder(target_tab, command_list)
      }
    },
    
    changeToRunningMode: function() {
      test_running = true;
      $("#run").attr("src", "/images/icons/pause.png");
    },

    changeToNotRunningMode: function() {
      test_running = false;
      $("#run").attr("src", "/images/icons/run.png");
    }, 
  
    pause: function() {
      this.changeToNotRunningMode();
    },
  

    /**
     * CommandList events
     */

    getCommandList: function() {
      var $rows = $(".input-row");
      var command_list = [];
      for (var i = 0, length = $rows.length; i < length; i++) {
        var $row_children = $rows.eq(i).children();
        var command = $row_children.eq(0).html();
        var target_spl = $row_children.eq(1).text().split("=", 2);
        var target = {};
        if (target_spl.length === 1) {
          target.value = target_spl[0];
        } else {
          target.type = target_spl[0];
          target.value = target_spl[1];
        }
        var value = $row_children.eq(2).text();
        command_list.push({row_no: i, command: command, target: target, value: value});
      }
      return command_list;
    },
  

    /**
     * Input-row events
     */

    deleteAllInputRow: function() {
      $(".input-row").each(function(i, tr){
        $(tr).remove();
      });
    },
  
    addNewCommand: function(command, target, value) {
      if (!on_rec) {
        return;
      }

      var self = this;
      $("#command").val(command);

      // set target
      var target_in_list= "";
      if (target.locators === undefined) {
        var $disabled_select_elm = $("<select/>");
        $disabled_select_elm.attr('id', 'target_type');
        $disabled_select_elm.attr('disabled', 'disabled');
        $("#target")
          .empty()
          .append($disabled_select_elm)
          .append(self.createTargetValueInputElm(target));
        target_in_list = target;
      } else {
        var $select_elm = self.createTargetTypeSelectElm(target.locators);
        var target_value = $("option:selected", $select_elm).val()
        $("#target")
          .empty()
          .append($select_elm)
          .append(self.createTargetValueInputElm(target_value));

        var selected = $("option:selected", "#target_type");
        target_in_list = selected.text() + "=" + selected.val();
      }

      $("#value").val(value);

      // add command tr
      var newInput = "<tr class='input-row'>" +
                     "<td>" + $("#command").val() + "</td>" +
                     "<td>" + target_in_list + "</td>" + 
                     "<td>" + $("#value").val() + "</td>" +
                     "<td><input class='img-delete' type='image' src='/images/icons/delete.png'></td>" +
                     "<input type='hidden' class='target_html' value='" + $("#target").html() + "'/>" + 
                     "</tr>";
      $("#input_list tr:last").after(newInput);
      this.$selectedInputRow = $("tr.input-row").last();
  
      // move new input tr
      $("#input_list tr:last").after($("#add_new_input"));
    },

    selectInputRow: function(e) { 
      var $row_children = $(e.currentTarget).children();
      var command = $row_children.eq(0).html();
      $("#command").val(command);
      //var target_html = $("input.target_html", $row_children).val();
      var target_html = $row_children.eq(4).val();
      $("#target").html(target_html);
      if ($("#target_type").attr("disabled") === undefined) {
        var target_value = $("option:selected", "#target_type").val();
      } else {
        var target_value = $row_children.eq(1).text();
      }
      $("#target_value").val(target_value);
      var value = $row_children.eq(2).text();
      $("#value").val(value);
      this.changeSelectedInputRow(e.currentTarget);
    },
  
    changeTargetType: function(ev) {
      $("#target select").find("[selected=selected]").removeAttr("selected")
      $("#target option:selected").attr("selected", "selected");
      $("#target_value").val($('option:selected', ev.target).val());
      this.updateSelectedInputRow();
    },

    changeCommand: function(ev) {
      var $row_children = this.$selectedInputRow.children();
      $row_children.eq(0).html($(ev.target).val());
      this.updateSelectedInputRow()
    },

    updateSelectedInputRow: function() {
      var $row_children = this.$selectedInputRow.children();
      var $sel_opt = $('option:selected', $("#target_type"));
      var target_val = $("#target_value").val();
      if ($sel_opt.length > 0) {
        $sel_opt.val(target_val);
        target_val = $sel_opt.text() + "=" + target_val;
      }
      $row_children.eq(1).html(target_val);
      $row_children.eq(2).html($("#value").val());
      $row_children.eq(4).val($("#target").html());
    },

    updateSelectedInputRowWithLatency: function() {
      var self = this;
      setTimeout(function() { self.updateSelectedInputRow(); }, 50);
    },

    keypressInValueTextarea: function(ev) {
      if(ev.keyCode === KEYCODE_ENTER){
        this.execNativeDriverInterpreterCommand($("#command").val(), $("#target").val(), $("#value").val());
        this.updateInputRow(ev);
      }
    },
  
    deleteInputRow: function(e) {
      $(e.target).parent().parent().remove();
      // stop event bubbling
      e.stopPropagation();
    },
  
    changeSelectedInputRow: function(row) {
      if (this.$selectedInputRow) {
        this.$selectedInputRow.removeClass("selected-row");
      }
      this.$selectedInputRow = $(row);
      this.$selectedInputRow.addClass("selected-row");
      $("#input_list").tableDnD();
    },
  
    addInputRow: function(e) {
      var newInput = "<tr class='input-row'><td></td><td></td><td></td><td><input class='img-delete' type='image' src='/images/icons/delete.png'></td></tr>";
      $("#input_list tr:last").after(newInput);
      $("#input_list tr:last").after($("#add_new_input"));
      $("#command").val("");
      $target_type = $("#target_type");
      $target_type.removeAttr("disabled");
      $("#target_type").empty();
      $target_type.append($("<option value=''>id</option>"));
      $target_type.append($("<option value=''>name</option>"));
      $target_type.append($("<option value=''>cssSelector</option>"));
      $target_type.append($("<option value=''>linkText</option>"));
      $("#target_value").val("");
      $("#value").val("");
      this.changeSelectedInputRow($("tr.input-row").last());
      this.updateSelectedInputRow();
    },
  


    /**
     * Other events
     */

    setBaseUrl: function(target_tab) {
      $("#base_url").val(target_tab.url);
      this.addNewCommand("open", "/", null);
    },
  
    addListAndExecCommand: function(command, target, value) {
      this.addNewCommand(command, target, value);
      this.execNativeDriverInterpreterCommand(command, target, value);
    },

    addLog: function(response) {
      $tr = $("<tr/>");
      $td = $("<td/>")
      $td.text(response.message);
      if (response.result === "failed") {
        $td.addClass("log-error-row");
      } 
      $("#log_table").append($tr.append($td));
    },

    reloadPage: function(target_tab) {
      chrome.tabs.sendRequest(target_tab.id, {to: "test_runner", method: "reloadPage", url: $("#base_url").val()}, function(response) {});
    },

    createTargetTypeSelectElm: function(locators) {
      var $select = $("<select/>");
      $select.attr('id', 'target_type');
  
      for (var i = 0, length = locators.length; i < length; i++) {
        var locator = locators[i];
        var $option = $("<option/>");
        $option.text(locator.type);
        $option.attr("value", locator.value);
        if (locator.type === "linkText") {
          $option.attr("selected", "selected");
        }
        $select.append($option);
      }
      return $select;
    },

    createTargetValueInputElm: function(target_value) {
      var $input = $("<input/>");
      $input.attr('id', 'target_value');
      $input.attr("type", "text");
      $input.attr("length", "25");
      $input.val(target_value);
      return $input;
    },
  


    /**
     * Not implemented
     */

    keyBackMouseDown: function() {
      if (!on_rec) {
        return;
      }
      this.addListAndExecCommand("back", "", "");
    },
  
    keyHomeMouseDown: function() {
      if (!on_rec) {
        return;
      }
      this.addListAndExecCommand("home", "", "");
    },
  
    keyMenuMouseDown: function() {
      if (!on_rec) {
        return;
      }
      this.addListAndExecCommand("menu", "", "");
    },


    /**
     * Test
     */

    initialize_test: function() {
      this.initialize();
    },

  });

  new IDEView;
});
