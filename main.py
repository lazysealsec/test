from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

# 设置浏览器选项
chrome_options = Options()
chrome_options.add_argument("--start-maximized")  # 启动时最大化窗口
chrome_options.add_argument("--disable-notifications")  # 禁用通知

# 初始化 WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

try:
    # 打开目标网站
    driver.get("https://eaa.byops.io")

    # 等待页面加载
    time.sleep(3)  # 根据实际情况调整等待时间

    # 定位用户名输入框并输入用户名
    username_input = driver.find_element(By.ID, "username")  # 替换为实际的用户名输入框ID
    username_input.send_keys("your_username")

    # 定位密码输入框并输入密码
    password_input = driver.find_element(By.ID, "password")  # 替换为实际的密码输入框ID
    password_input.send_keys("your_password")

    # 提交登录表单
    password_input.send_keys(Keys.RETURN)  # 或者点击登录按钮
    # login_button = driver.find_element(By.ID, "login-button")  # 替换为实际的登录按钮ID
    # login_button.click()

    # 等待登录完成后的页面加载
    time.sleep(5)  # 根据实际情况调整等待时间

    # 在此处添加更多操作，如导航到其他页面或提取信息

finally:
    # 关闭浏览器
    driver.quit()
