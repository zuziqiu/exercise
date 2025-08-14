# sys 模块提供了对解释器使用或维护的变量的访问，并提供了与解释器进行强交互的函数。
import sys
# time 模块提供了与时间相关的各种功能。
import time
# threading 模块提供了多线程编程的API。
import threading
# subprocess 模块允许你启动新进程，连接到它们的输入/输出/错误管道，并获取它们的返回码。
import subprocess
# win32gui 提供了对 Windows GUI 函数的访问，用于查找和控制窗口句柄。
import win32gui
# win32con 提供了各种 Windows 常量，如窗口消息类型。
import win32con
# json 模块用于对 JSON 数据进行编码和解码。
import json
# os 模块提供了与操作系统进行交互的函数，如文件路径操作。
import os
# keyboard 模块用于监听和发送全局键盘事件。
import keyboard
# pywinauto 库用于 Windows GUI 自动化。
from pywinauto import Application
# pywinauto.findwindows 模块中的 ElementNotFoundError 用于处理找不到窗口的异常。
from pywinauto.findwindows import ElementNotFoundError
# win10toast_persist 库用于显示 Windows 10 通知，并支持持久化和回调。
from win10toast_persist import ToastNotifier
# PyQt5.QtWidgets 包含各种 GUI 窗口部件，如 QApplication, QSystemTrayIcon 等。
from PyQt5.QtWidgets import (QApplication, QSystemTrayIcon, QMenu, QAction,
                             QWidget, QLabel, QPushButton, QVBoxLayout, QHBoxLayout,
                             QDialog, QCheckBox, QDialogButtonBox)
# PyQt5.QtGui 包含图形相关的类，如 QIcon, QFont。
from PyQt5.QtGui import QIcon, QFont
# PyQt5.QtCore 包含核心的非 GUI 功能，如 QObject, pyqtSignal, QThread, Qt, QTimer, QSettings。
from PyQt5.QtCore import QObject, pyqtSignal, QThread, Qt, QTimer, QSettings

# 导入 Gemini SDK，用于调用谷歌 Gemini AI 模型。
import google.generativeai as genai

# 这是为了解决 PyInstaller 打包时可能出现的依赖问题而做的特殊处理。
try:
    from pywinauto.keyboard import send_keys
    from pywinauto.timings import Timings
except ImportError:
    pass

### 在这里替换你的 Gemini API 密钥 ###
# 请前往 https://aistudio.google.com/app/apikey 申请你的密钥。
API_KEY = "YOUR_GEMINI_API_KEY"
# 使用你的 API 密钥配置 Gemini。
genai.configure(api_key=API_KEY)

class Signals(QObject):
    """
    一个用于线程间通信的信号类。
    由于 PyQt5 的 UI 操作必须在主线程，而微信监控在子线程，
    通过信号可以安全地进行跨线程通信，避免直接操作UI组件。
    """
    # 插件状态消息，用于在系统托盘通知中显示。
    status_message = pyqtSignal(str)
    # 未能回复的消息，用于发送给桌面小窗口。
    unhandled_message = pyqtSignal(str, str)
    # 一个用于显示设置窗口的信号，由全局快捷键触发。
    show_settings_signal = pyqtSignal()

class WeChatAutoReplyWorker(QThread):
    """
    插件的核心工作线程。它负责在后台监控微信消息，
    并调用 Gemini 模型来生成回复。
    """
    def __init__(self, signals):
        # 调用父类 QThread 的构造函数。
        super().__init__()
        # 接收并保存信号对象。
        self.signals = signals
        # 创建一个 ToastNotifier 实例，用于监听 Windows 通知。
        self.toaster = ToastNotifier()
        # 微信应用的句柄，初始化为 None。
        self.wechat_app = None
        # 一个用于控制线程停止的标志。
        self.should_stop = False
        # 从本地 JSON 文件加载商品信息。
        self.products = self.load_products_from_json()
        # 初始化 Gemini 模型。
        self.model = self.initialize_gemini()
        
    def load_products_from_json(self):
        """
        从名为 products.json 的本地文件加载商品信息。
        """
        json_file = "products.json"
        # 检查文件是否存在。
        if os.path.exists(json_file):
            try:
                # 以 UTF-8 编码读取 JSON 文件。
                with open(json_file, "r", encoding="utf-8") as f:
                    products_data = json.load(f)
                    # 发送成功加载的消息给主线程。
                    self.signals.status_message.emit(f"成功加载 {len(products_data)} 件商品信息。")
                    return products_data
            except Exception as e:
                # 如果文件加载失败，发送错误消息。
                self.signals.status_message.emit(f"错误: products.json 文件加载失败: {e}")
                return []
        else:
            # 如果文件不存在，发送错误消息。
            self.signals.status_message.emit(f"错误: 找不到 {json_file} 文件。")
            return []

    def initialize_gemini(self):
        """
        初始化 Gemini 模型并处理可能发生的错误。
        """
        try:
            # 创建一个 'gemini-pro' 模型的实例。
            model = genai.GenerativeModel('gemini-pro')
            # 发送成功消息。
            self.signals.status_message.emit("Gemini 模型已加载。")
            return model
        except Exception as e:
            # 如果加载失败，发送错误消息。
            self.signals.status_message.emit(f"Gemini 模型加载失败: {e}")
            return None

    def run(self):
        """
        这是 QThread 的主循环函数，当线程启动时会执行。
        """
        # 检查 Gemini 模型和商品信息是否都已准备好。
        if not self.model or not self.products:
            self.signals.status_message.emit("Gemini 模型或商品信息未准备好，监控已停止。")
            self.stop()
            return

        # 发送线程启动消息。
        self.signals.status_message.emit("后台监控线程已启动...")
        # 确保微信应用正在运行。
        self.start_wechat_if_not_running()
        # 开始监听微信通知。
        self.handle_notification()
    
    def stop(self):
        """
        设置停止标志，安全地停止线程。
        """
        self.should_stop = True
    
    def find_wechat_window(self):
        """
        通过窗口标题 "微信" 查找并返回微信主窗口的句柄。
        """
        try:
            return win32gui.FindWindow(None, "微信")
        except:
            return None

    def start_wechat_if_not_running(self):
        """
        如果微信没有运行，则通过命令行启动它。
        """
        try:
            # 尝试连接已运行的微信窗口。
            self.wechat_app = Application(backend="uia").connect(title_re=".*微信.*")
            self.signals.status_message.emit("微信已在运行。")
        except ElementNotFoundError:
            # 如果找不到微信窗口，则启动微信程序。
            self.signals.status_message.emit("微信未运行，正在尝试启动...")
            subprocess.Popen("C:/Program Files (x86)/Tencent/WeChat/WeChat.exe")
            # 等待足够的时间，让微信启动完成。
            time.sleep(10)
            # 再次尝试连接微信窗口。
            self.wechat_app = Application(backend="uia").connect(title_re=".*微信.*")
            self.signals.status_message.emit("微信已成功启动。")
        except Exception as e:
            self.signals.status_message.emit(f"启动微信失败: {e}")

    def handle_notification(self):
        """
        监听并处理收到的 Windows 通知。
        """
        def notification_callback(notification_text):
            # 只有当通知包含 "收到新的消息" 且线程未停止时才进行处理。
            if "收到新的消息" in notification_text and not self.should_stop:
                print(f"收到通知: {notification_text}")
                sender_name, message_content = self.parse_notification(notification_text)
                if sender_name and message_content:
                    self.process_message(sender_name, message_content)
        
        # 显示一个持久化的 Windows 通知，当用户点击时会调用回调函数。
        self.toaster.show_toast(
            "微信自动回复", 
            "监听已启动，请保持微信后台运行。",
            duration=3,
            threaded=True,
            callback_on_click=notification_callback
        )
        
        # 持续运行，以等待新的通知，直到 should_stop 标志为 True。
        while not self.should_stop:
            time.sleep(1)

    def parse_notification(self, text):
        """
        从通知文本中解析出发送者和消息内容。
        """
        try:
            # 通知文本格式通常为 "发送者：消息内容"，使用 "：" 分割。
            parts = text.split("：", 1)
            if len(parts) > 1:
                # 清理发送者名称，移除 "(收到新的消息)"。
                sender = parts[0].replace(" (收到新的消息)", "").strip()
                message = parts[1].strip()
                return sender, message
        except Exception as e:
            self.signals.status_message.emit(f"解析通知失败: {e}")
        return None, None

    def process_message(self, sender, message):
        """
        使用 Gemini 模型处理消息并生成回复。
        """
        self.signals.status_message.emit(f"收到来自 '{sender}' 的消息: '{message}'")
        
        # 排除不需要自动回复的联系人，如文件传输助手或群聊。
        if "文件传输助手" in sender or "群聊" in sender:
            return

        try:
            # 将商品信息转换为 JSON 字符串，作为提示的一部分提供给 Gemini。
            product_info_str = json.dumps(self.products, ensure_ascii=False, indent=2)
            
            # 构建一个详细的提示，包括角色设定、商品信息和用户消息。
            prompt = f"""
            你是一位专业的客服机器人，正在回复微信消息。你负责销售以下商品：
            {product_info_str}

            你收到了来自 '{sender}' 的消息：'{message}'。

            请根据以上商品信息和收到的消息，用友好、简洁的语言直接生成一条回复。如果问题无法回答或与商品无关，请礼貌地表示你稍后会联系人工客服处理。
            """
            
            # 调用 Gemini API 生成内容。
            response = self.model.generate_content(prompt)
            # 获取生成的文本并去除首尾空白。
            reply_text = response.text.strip()
            
            # 如果 Gemini 成功生成了回复。
            if reply_text:
                self.reply_message(sender, reply_text)
            else:
                # 如果回复为空，发送信号通知主线程该消息未能处理。
                self.signals.unhandled_message.emit(sender, message)
                self.signals.status_message.emit("Gemini 未能生成有效回复，消息已标记。")

        except Exception as e:
            # 如果调用 Gemini 失败（例如网络错误），同样将消息标记为未处理。
            self.signals.unhandled_message.emit(sender, message)
            self.signals.status_message.emit(f"Gemini 生成回复失败: {e}，消息已标记。")

    def reply_message(self, sender, reply_text):
        """
        在后台使用 pywinauto 库来自动化微信回复操作。
        """
        try:
            # 连接到微信窗口。
            wechat_window = self.wechat_app.window(title_re=".*微信.*")
            
            # 使用 win32gui 恢复窗口，使其可见但不获得焦点，避免打扰用户。
            win32gui.PostMessage(self.find_wechat_window(), win32con.WM_SYSCOMMAND, win32con.SC_RESTORE, 0)
            
            # 找到聊天列表，并通过发送者名称点击相应的联系人。
            chat_list = wechat_window.child_window(title="会话", control_type="List")
            contact_item = chat_list.child_window(title=sender, control_type="ListItem")
            contact_item.click_input()
            
            # 找到消息输入框，并设置焦点。
            input_box = wechat_window.child_window(title="输入", control_type="Edit")
            input_box.set_focus()
            # 输入回复文本。
            input_box.type_keys(reply_text, with_newlines=False)
            
            # 模拟按 Enter 键发送消息。
            input_box.type_keys("{ENTER}")
            self.signals.status_message.emit(f"已回复 '{sender}': '{reply_text}'")

        except Exception as e:
            self.signals.status_message.emit(f"回复失败: {e}")
        
        # 确保微信窗口在回复后最小化，恢复到后台状态。
        wechat_window = self.wechat_app.window(title_re=".*微信.*")
        if wechat_window.exists():
            wechat_window.minimize()

class UnhandledMessageWindow(QWidget):
    """
    一个无边框、固定大小的桌面小窗口，用于显示未处理的消息。
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        # 设置窗口标志：保持在最顶层，无边框。
        self.setWindowFlags(Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint)
        # 设置背景透明，以便只显示内容。
        self.setAttribute(Qt.WA_TranslucentBackground, True)
        # 设置窗口的固定大小。
        self.setFixedSize(300, 80)
        
        # 存储未处理消息的列表。
        self.unhandled_messages = []
        # 当前显示消息在列表中的索引。
        self.current_index = 0
        # 轮滚状态标志。
        self.is_scrolling = False
        
        # 初始化UI组件。
        self.init_ui()
        # 将窗口定位到桌面右下角。
        self.position_window()
        
    def init_ui(self):
        """
        初始化小窗口的UI布局和控件。
        """
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(5, 5, 5, 5)
        
        # 顶部布局，用于放置标题和关闭按钮。
        top_layout = QHBoxLayout()
        title_label = QLabel("未处理消息")
        title_label.setFont(QFont("Arial", 10, QFont.Bold))
        title_label.setStyleSheet("color: white;")
        top_layout.addWidget(title_label)
        top_layout.addStretch()
        
        # 关闭按钮。
        close_button = QPushButton("x")
        close_button.setStyleSheet("""...""") # 设置按钮样式
        close_button.setFixedSize(20, 20)
        # 当点击按钮时，调用重置和隐藏窗口的函数。
        close_button.clicked.connect(self.reset_and_hide_window)
        top_layout.addWidget(close_button)
        
        main_layout.addLayout(top_layout)
        
        # 消息显示标签。
        self.message_label = QLabel("暂无未处理消息。")
        self.message_label.setFont(QFont("Arial", 9))
        self.message_label.setStyleSheet("...") # 设置标签样式
        self.message_label.setWordWrap(True)
        self.message_label.setAlignment(Qt.AlignTop)
        main_layout.addWidget(self.message_label)
        
        # 定时器，用于触发消息轮滚。
        self.message_timer = QTimer(self)
        self.message_timer.timeout.connect(self.scroll_messages)

    def position_window(self):
        """
        获取屏幕可用区域，将窗口定位到右下角。
        """
        screen_geometry = QApplication.desktop().availableGeometry()
        x = screen_geometry.width() - self.width() - 10
        y = screen_geometry.height() - self.height() - 10
        self.move(x, y)

    def add_unhandled_message(self, sender, message):
        """
        将新的未处理消息添加到队列中，并在必要时启动轮滚。
        """
        self.unhandled_messages.append((sender, message))
        if not self.is_scrolling:
            self.start_scrolling()

    def start_scrolling(self):
        """
        如果消息队列不为空，则显示窗口并开始轮滚。
        """
        if self.unhandled_messages:
            self.is_scrolling = True
            self.show()
            self.scroll_messages()
            self.message_timer.start(5000) # 每隔5秒轮滚一条消息。
    
    def scroll_messages(self):
        """
        定时器触发的函数，用于更新消息标签的内容。
        """
        if not self.unhandled_messages:
            self.message_label.setText("暂无未处理消息。")
            self.stop_scrolling()
            return
        
        sender, message = self.unhandled_messages[self.current_index]
        self.message_label.setText(f"来自 {sender} 的新消息:\n{message}")
        
        # 更新索引，实现循环轮滚。
        self.current_index = (self.current_index + 1) % len(self.unhandled_messages)
    
    def reset_and_hide_window(self):
        """
        重置小窗口的状态，包括停止轮滚、清空消息队列并隐藏窗口。
        """
        self.stop_scrolling()
        self.unhandled_messages = []
        self.message_label.setText("暂无未处理消息。")
        self.hide()
        self.current_index = 0
    
    def stop_scrolling(self):
        """
        停止消息轮滚。
        """
        self.is_scrolling = False
        self.message_timer.stop()

class SettingsDialog(QDialog):
    """
    插件的设置对话框，允许用户配置是否显示未处理消息提醒窗口。
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("插件设置")
        self.setFixedSize(300, 150)
        # 使用 QSettings 来保存和加载配置，它会自动处理不同操作系统的配置存储。
        self.settings = QSettings("WeChatGeminiPlugin", "Settings")
        self.init_ui()
        self.load_settings()

    def init_ui(self):
        """
        初始化设置窗口的UI。
        """
        main_layout = QVBoxLayout(self)
        
        self.show_unhandled_window_checkbox = QCheckBox("弹出未处理消息提醒窗口")
        main_layout.addWidget(self.show_unhandled_window_checkbox)
        
        main_layout.addStretch()
        
        # 创建一个带有 "确定" 和 "取消" 按钮的标准按钮盒。
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(self.save_settings)
        button_box.rejected.connect(self.reject)
        main_layout.addWidget(button_box)
    
    def load_settings(self):
        """
        从 QSettings 加载 'showUnhandledWindow' 的布尔值。
        如果不存在，默认值为 True。
        """
        show_window = self.settings.value("showUnhandledWindow", True, type=bool)
        self.show_unhandled_window_checkbox.setChecked(show_window)
        
    def save_settings(self):
        """
        将复选框的状态保存到 QSettings 中，然后接受并关闭对话框。
        """
        self.settings.setValue("showUnhandledWindow", self.show_unhandled_window_checkbox.isChecked())
        self.accept()

class SystemTrayApp(QApplication):
    """
    主程序类，负责整个插件的生命周期管理。
    """
    def __init__(self, argv):
        super().__init__(argv)
        # 设置当所有窗口关闭时程序不退出，因为我们的主要界面是系统托盘。
        self.setQuitOnLastWindowClosed(False)
        self.settings = QSettings("WeChatGeminiPlugin", "Settings")
        self.signals = Signals()
        self.worker_thread = WeChatAutoReplyWorker(self.signals)
        # 创建未处理消息的小窗口。
        self.unhandled_window = UnhandledMessageWindow()
        # 创建设置对话框。
        self.settings_dialog = SettingsDialog(self.unhandled_window)

        # 创建系统托盘图标。
        self.tray_icon = QSystemTrayIcon(QIcon("icon.png"), self)
        self.tray_icon.setToolTip("微信自动回复插件")
        
        # 创建系统托盘菜单。
        self.menu = QMenu()
        
        # "开始监控" 菜单项。
        self.start_action = QAction("开始监控", self)
        self.start_action.triggered.connect(self.start_monitoring)
        self.menu.addAction(self.start_action)

        # "停止监控" 菜单项。
        self.stop_action = QAction("停止监控", self)
        self.stop_action.triggered.connect(self.stop_monitoring)
        self.stop_action.setEnabled(False) # 初始时禁用此选项
        self.menu.addAction(self.stop_action)
        
        self.menu.addSeparator()

        # "设置" 菜单项。
        settings_action = QAction("设置", self)
        settings_action.triggered.connect(self.show_settings_dialog)
        self.menu.addAction(settings_action)

        # "退出" 菜单项。
        self.quit_action = QAction("退出", self)
        self.quit_action.triggered.connect(self.quit)
        self.menu.addAction(self.quit_action)

        # 将菜单与托盘图标关联。
        self.tray_icon.setContextMenu(self.menu)
        # 显示托盘图标。
        self.tray_icon.show()
        
        # 连接信号与槽。
        self.signals.status_message.connect(self.show_tray_message)
        self.signals.unhandled_message.connect(self.handle_unhandled_message)
        self.signals.show_settings_signal.connect(self.show_settings_dialog)
        
        # 启动全局快捷键监听线程。daemon=True 确保主程序退出时该线程也退出。
        self.hotkey_thread = threading.Thread(target=self.register_hotkey, daemon=True)
        self.hotkey_thread.start()

    def register_hotkey(self):
        """
        在新线程中注册全局快捷键 Ctrl+Alt+S。
        """
        try:
            # 注册快捷键，当按下时调用 show_settings_signal_handler。
            keyboard.add_hotkey('ctrl+alt+s', self.show_settings_signal_handler)
            print("快捷键 Ctrl+Alt+S 已注册。")
            # keyboard.wait() 会阻塞这个线程，使其保持监听状态。
            keyboard.wait()
        except Exception as e:
            print(f"快捷键注册失败: {e}")

    def show_settings_signal_handler(self):
        """
        处理快捷键事件的回调函数。
        """
        # 发送信号到主线程，请求显示设置窗口。
        self.signals.show_settings_signal.emit()

    def start_monitoring(self):
        """
        开始监控功能。
        """
        if not self.worker_thread.isRunning():
            self.worker_thread.should_stop = False
            self.worker_thread.start()
            self.start_action.setEnabled(False)
            self.stop_action.setEnabled(True)
            self.show_tray_message("微信自动回复", "监控已启动。")
    
    def stop_monitoring(self):
        """
        停止监控功能。
        """
        if self.worker_thread.isRunning():
            self.worker_thread.stop()
            self.worker_thread.wait() # 等待线程结束
            self.start_action.setEnabled(True)
            self.stop_action.setEnabled(False)
            self.unhandled_window.hide() # 停止时隐藏小窗口
            self.show_tray_message("微信自动回复", "监控已停止。")
    
    def handle_unhandled_message(self, sender, message):
        """
        槽函数，接收未处理消息信号。
        """
        # 从配置中读取是否显示小窗口。
        show_window = self.settings.value("showUnhandledWindow", True, type=bool)
        if show_window:
            self.unhandled_window.add_unhandled_message(sender, message)
        # 无论是否显示小窗口，都弹出系统托盘通知。
        self.show_tray_message("未处理消息", f"来自 {sender} 的新消息。")
            
    def show_settings_dialog(self):
        """
        显示设置对话框。
        """
        # 检查窗口是否已显示，防止重复弹出。
        if not self.settings_dialog.isVisible():
            self.settings_dialog.show()
            self.settings_dialog.raise_()
            self.settings_dialog.activateWindow()
    
    def show_tray_message(self, title, message):
        """
        在系统托盘弹出通知。
        """
        self.tray_icon.showMessage(title, message, QSystemTrayIcon.Information, 2000)

    def quit(self):
        """
        退出程序。
        """
        self.stop_monitoring()
        self.tray_icon.hide()
        # 退出时解绑所有快捷键，释放资源。
        keyboard.unhook_all()
        QApplication.quit()

if __name__ == "__main__":
    # 创建 QApplication 实例。
    app = SystemTrayApp(sys.argv)
    # 进入应用程序的事件循环。
    sys.exit(app.exec_())