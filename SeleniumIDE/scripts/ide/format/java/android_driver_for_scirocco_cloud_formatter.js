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

var AndroidDriverForSciroccoCloudFormatter = function(class_name, base_url) {
  this.uber.constructor(class_name, base_url)
};

Utils.inherit(AndroidDriverForSciroccoCloudFormatter, WebDriverFormatter)
 
AndroidDriverForSciroccoCloudFormatter.prototype.header = function() {
  var header = ''
    + 'import java.util.concurrent.TimeUnit;\n'
    + 'import junit.framework.TestCase;\n'
    + 'import org.junit.*;\n'
    + 'import org.openqa.selenium.*;\n'
    + 'import org.openqa.selenium.android.AndroidDriver;\n'
    + '\n'
    + 'public class ' + this.class_name + ' extends TestCase {\n'
    + '  private WebDriver driver;\n'
    + '  private String baseUrl;\n'
    + '  \n'
    + this.setUp()
    + '  \n';
  return header;
};

AndroidDriverForSciroccoCloudFormatter.prototype.setUp = function() {
  var setUp = ''
    + '  @Before\n'
    + '  public void setUp() throws Exception {\n'
    + '    driver = new AndroidDriver();\n'
    + '    baseUrl = "' + this.base_url + '";\n'
    + '    driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);\n'
    + '  }\n';
  return setUp;
};
