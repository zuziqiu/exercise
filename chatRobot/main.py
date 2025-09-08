# -*- coding: utf-8 -*-
import sys
import os
import time
import threading
import logging
import psutil
from PyQt5.QtWidgets import QApplication, QSystemTrayIcon, QMenu, QAction
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QTimer, Qt, QCoreApplication

# 设置环境变量以避免 Qt 和 COM 冲突
os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"
os.environ["QT_QPA_PLATFORM"] = "windows:dpiawareness=0"

# === 1. 配置日志 ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wechat_bot.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

# === 2. 微信监控工作线程 ===
class WeChatMonitorThread(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.running = True
        self.wechat_app = None
        self.wechat_main_window = None
        self.pyautogui = None
        self.Application = None
        self.send_keys = None

    def run(self):
        """线程主函数，负责处理微信自动化和 COM 初始化"""
        try:
            # 在此线程中导入所需的库
            from pywinauto import Application
            from pywinauto.keyboard import send_keys
            import pyautogui
            self.pyautogui = pyautogui
            self.Application = Application
            self.send_keys = send_keys
        except ImportError:
            logging.critical("无法导入 pywinauto 或 pyautogui，请先安装：pip install pywinauto pyautogui")
            return
            
        logging.info("监控线程已启动，开始处理微信自动化...")
        
        while self.running:
            try:
                # 尝试连接微信进程
                if not self.wechat_main_window or not self.wechat_main_window.exists():
                    wechat_pid = self.find_wechat_process()
                    if wechat_pid:
                        self.wechat_app = self.Application(backend="uia").connect(process=wechat_pid)
                        self.wechat_main_window = self.wechat_app.window(title="微信")
                        logging.info("微信连接成功")
                    else:
                        logging.warning("微信未运行，5秒后重试")
                        time.sleep(5)
                        continue

                self.check_and_reply()

            except Exception as e:
                logging.error(f"监控线程错误: {e}")
                self.wechat_app = None
                self.wechat_main_window = None
                time.sleep(5)

            time.sleep(2) # 每2秒检查一次

    def find_wechat_process(self):
        """查找微信进程 PID"""
        for proc in psutil.process_iter(['pid', 'name']):
            if proc.info['name'].lower() in ['wechat.exe']:
                return proc.info['pid']
        return None

    def check_and_reply(self):
        """
        检查是否有未读消息并回复
        结合 pyautogui 图像识别和 pywinauto UI 自动化
        """
        logging.info("正在使用图像识别查找未读消息图标...")
        try:
            # 使用 pyautogui 在屏幕上查找 'msg_reference.png'
            unread_locations = self.pyautogui.locateAllOnScreen('msg_reference.png', confidence=0.8)
            
            # 遍历所有找到的红点位置
            for unread_location in unread_locations:
                logging.info(f"成功找到未读消息图标，位置: {unread_location}")

                # 将找到的坐标转换为 UI 控件
                # 由于找到的是红点，它所在的 ListItem 控件会比红点大
                # 我们通过红点的中心坐标去寻找它所在的父控件
                chat_item = self.wechat_main_window.from_point(
                    (unread_location.left + unread_location.width // 2, 
                     unread_location.top + unread_location.height // 2)
                )

                if chat_item.exists() and chat_item.control_type == "ListItem":
                    logging.info("成功定位到ListItem控件。")

                    # 检查会话名称是否为“勤屎黄”
                    try:
                        # 查找 ListItem 内部的 Text 控件，通常第一个就是人名
                        name_control = chat_item.child_window(control_type="Text", found_index=0)
                        chat_name = name_control.window_text()

                        if chat_name == "勤屎黄":
                            logging.info(f"会话名称匹配 '勤屎黄'，正在准备回复...")
                            
                            # 激活微信主窗口并聚焦
                            self.wechat_main_window.set_focus()
                            
                            # 点击这个未读会话
                            chat_item.click_input()
                            time.sleep(1)
                            
                            # 找到输入框并发送消息
                            logging.info("正在尝试查找输入框...")
                            input_box = self.wechat_main_window.child_window(title="输入", control_type="Edit")
                            
                            if input_box.exists():
                                logging.info("成功找到输入框。")
                                input_box.set_focus()
                                self.send_keys("收到")
                                self.send_keys("{ENTER}")
                                logging.info("已成功自动回复：'收到'")
                                return # 处理完毕后立即返回
                            else:
                                logging.warning("未找到输入框。")
                                return

                        else:
                            logging.info(f"会话名称不匹配 '勤屎黄'，跳过回复。")
                            continue # 继续寻找下一个红点
                    except Exception as e:
                        logging.warning(f"无法获取会话名称，跳过。错误: {e}")
                        continue
                
            logging.info("未找到符合条件的未读消息会话。")

        except self.pyautogui.PyAutoGUIException as e:
            logging.error(f"图像识别失败: {e}. 请检查 'msg_reference.png' 文件是否存在。")
        except Exception as e:
            logging.error(f"消息处理出错: {e}")

# === 3. 主应用和系统托盘 ===
class WeChatAutoReply(QApplication):
    def __init__(self, argv):
        super().__init__(argv)
        self.setQuitOnLastWindowClosed(False)
        self.monitor_thread = None
        self.tray_icon = QSystemTrayIcon(QIcon("icon.ico"))
        self._setup_tray()
        self.tray_icon.show()
        logging.info("微信机器人启动成功 (UI模式)")
        
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self._check_status)
        self.status_timer.start(2000)

    def _setup_tray(self):
        """初始化托盘菜单"""
        menu = QMenu()
        actions = [
            ("启动监控", self._start_monitor),
            ("停止监控", self._stop_monitor),
            ("退出程序", self._safe_quit)
        ]
        for text, callback in actions:
            action = QAction(text, self)
            action.triggered.connect(callback)
            menu.addAction(action)
        self.tray_icon.setContextMenu(menu)
        self.tray_icon.activated.connect(self._on_tray_activate)

    def _on_tray_activate(self, reason):
        """托盘图标点击事件"""
        if reason == QSystemTrayIcon.DoubleClick:
            self._start_monitor()

    def _start_monitor(self):
        """启动监控线程"""
        if self.monitor_thread and self.monitor_thread.is_alive():
            logging.info("监控已在运行")
            return
        
        self.monitor_thread = WeChatMonitorThread()
        self.monitor_thread.start()
        self.tray_icon.setToolTip("微信监控运行中")
        logging.info("微信监控已启动")

    def _stop_monitor(self):
        """停止监控"""
        if self.monitor_thread:
            self.monitor_thread.running = False
            self.monitor_thread.join(timeout=2)
            self.monitor_thread = None
        self.tray_icon.setToolTip("微信监控已停止")
        logging.info("微信监控已停止")

    def _check_status(self):
        """检查监控线程的状态"""
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.tray_icon.setToolTip("微信监控运行中")
        else:
            self.tray_icon.setToolTip("微信监控已停止")

    def _safe_quit(self):
        """安全退出程序"""
        self._stop_monitor()
        self.status_timer.stop()
        self.tray_icon.hide()
        self.quit()
        logging.info("程序已安全退出")

def main():
    """主函数"""
    print("""
    ================================
      微信自动回复机器人 (UI模式)
    ================================
    特点：
    1. 基于图像识别定位新消息
    2. 独立线程处理微信自动化，彻底解决COM冲突
    3. 系统托盘控制
    """)
    
    if QApplication.instance() is None:
        app = WeChatAutoReply(sys.argv)
    else:
        app = QApplication.instance()

    app.tray_icon.showMessage(
        "微信机器人", 
        "程序已启动，请右键托盘图标操作",
        QSystemTrayIcon.Information,
        3000
    )
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()