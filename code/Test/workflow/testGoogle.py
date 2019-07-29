#coding:utf-8
from selenium import webdriver
from selenium.webdriver.support.ui import Select
import unittest, time
from unittest import TestLoader, TestSuite
from HtmlTestRunner import HTMLTestRunner

class Google(unittest.TestCase):
    def setUp(self):  # set initilization
        chrome_path = r'/usr/local/bin/chromedriver' #path from 'which chromedriver'
        self.driver = webdriver.Chrome(executable_path=chrome_path)
        self.driver.implicitly_wait(30) # implicit watch for at most 30 seconds
        self.base_url = "http://www.google.com"
        self.verificationErrors = []    # when the code is running, the wrong message will be print into this list
        self.accept_next_alert = True  # whether to accept next alert

    def test_serach(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        driver.find_element_by_name("q").send_keys("Selenium webdriver")
        driver.find_element_by_name("btnK").click()
        time.sleep(2)
        driver.close()


    def test_redirect(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        link=driver.find_element_by_id("lga").find_element_by_css_selector('a').get_attribute('href')
        driver.get(link)
        time.sleep(2)


    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    testunit = unittest.TestSuite()  # define a unittest suite
    testunit.addTest(Google("test_serach"))  # add unit test into the suite
    testunit.addTest(Google("test_redirect"))
    runner = HTMLTestRunner(output='test_report')
    runner.run(testunit)
