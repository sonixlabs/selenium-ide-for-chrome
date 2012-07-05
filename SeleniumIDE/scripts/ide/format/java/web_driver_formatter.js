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


var WebDriverFormatter = function(class_name, base_url, chrome_driver_file_path) {
  this.uber.constructor(class_name, base_url)
  this.chrome_driver_file_path = chrome_driver_file_path  || "";
};

Utils.inherit(WebDriverFormatter, FormatterBase)

WebDriverFormatter.prototype.header = function() {
  var header = ""
    + 'import java.util.concurrent.TimeUnit;\n'
    + 'import junit.framework.TestCase;\n'
    + 'import org.junit.*;\n'
    + 'import org.openqa.selenium.*;\n'
    + 'import org.openqa.selenium.chrome.ChromeDriver;\n'
    + '\n'
    + 'public class ' + this.class_name + ' extends TestCase {\n'
    + '  private WebDriver driver;\n'
    + '  private String baseUrl;\n'
    + '  \n'
    + this.setUp()
    + '  \n';
  return header;
};

WebDriverFormatter.prototype.setUp = function() {
  var setUp = ''
    + '  @Before\n'
    + '  public void setUp() throws Exception {\n'
    + '    // Download chromedriver (http://code.google.com/p/chromedriver/downloads/list)\n'
    + '    System.setProperty("webdriver.chrome.driver", "' + this.chrome_driver_file_path + '");\n'
    + '    driver = new ChromeDriver();\n'
    + '    baseUrl = "' + this.base_url + '";\n'
    + '    driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);\n'
    + '  }\n'
  return setUp;
};

WebDriverFormatter.prototype.footer = function() {
  var footer = ''
    + '  \n'
    + '  @After\n'
    + '  public void tearDown() throws Exception {\n'
    + '    driver.quit();\n'
    + '  }\n'
    + '}';
  return footer;
};

WebDriverFormatter.prototype.testcase_header = function() {
  var header = ''
    + '  @Test\n'
    + '  public void test() throws Exception {\n'
  return header;
};

WebDriverFormatter.prototype.testcase_footer = function() {
  return '  }\n';
};

WebDriverFormatter.prototype.findElement = function(target) {
  if (target != undefined && target.type != undefined && target.value != undefined) {
    return 'driver.findElement(By.' + target.type + '("' + target.value + '"))';
  } else {
    return "";
  }
};

WebDriverFormatter.prototype.open = function(row) {
   return this.indents(2) + 'driver.get(baseUrl + "' + row.target.value + '");\n';
};

WebDriverFormatter.prototype.click = function(row) {
   return this.indents(2) + this.findElement(row.target) + '.click();\n';
};

WebDriverFormatter.prototype.type = function(row) {
   return this.indents(2) + this.findElement(row.target) + '.sendKeys("' + row.value +'");\n'
};

WebDriverFormatter.prototype.sleep = function(row) {
   var sleepVal = row.value;
   if (sleepVal === "") {
     sleepVal = 0;
   }
   return this.indents(2) + 'Thread.sleep(' + sleepVal + ');\n';
};

WebDriverFormatter.prototype.screenshot = function(row) {
   return "// " + this.indents(2) + 'File screenshotFile = driver.getScreenshotAs(OutputType.FILE);\n';
};
