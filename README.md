# OCRPi

这是一个光学字符识别（Optical Character Recognition, OCR）的Web应用，OCR部分基于[CnOCR](https://github.com/breezedeus/CnOCR)，Web应用后端基于Python的Flask库。在树莓派4B上开发和部署。

将树莓派作为后端部署Web应用而不是直接用树莓派显示用户界面，可以很大程度节省树莓派的GPU和内存开销。并且，Web应用的移植性也比其他的GUI库好。

## 树莓派配置

如果使用树莓派作后端，你需要准备：

1. 树莓派
2. 5V-3A电源适配器
3. TF卡（建议容量不要过小，至少8GB）
4. 摄像头（不推荐第一代摄像头，非常模糊，不适合做文字识别）
5. 显示器和micro HDMI转HDMI视频线
6. 可以用USB-A连接的键盘鼠标
7. 如果你的电脑没有SD读卡器，你需要依据自己电脑的接口准备合适的SD读卡器
8. (Optional) 外壳/支架，散热风扇

显示器和键鼠的作用是安装系统、配置网络和摄像头，如果在固定网络下使用树莓派，显示器和键鼠只需要在初次配置时使用一次。

### 安装系统

准备好硬件之后：

1. 下载[Raspberry Pi Imager](https://www.raspberrypi.com/software/)并打开，连接TF卡至电脑，选择合适的系统，下载并写入。推荐64位带桌面环境的Raspberry Pi OS。
2. 将TF卡插入树莓派，开机，根据提示配置系统。
3. 在Configuration中开启Camera、SSH服务。

### 配置Python环境

系统会自带python3，在终端输入

```bash
python -V
```

可以查看python版本/检查是否安装python。

使用国内的pypi源：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

建议创建新的虚拟环境，以避免与之前安装的包产生版本冲突。

更新pip并安装此应用需要的库：

```bash
pip install --upgrade pip
pip install cnocr flask
```

### SSH连接并运行

将树莓派和需要连接至树莓派的电脑连接在同一个Wi-Fi下。Windows可以使用putty、macOS和Linux可以直接在终端进行SSH连接，或者使用VS Code的SSH插件进行连接：

```bash
ssh [username]@[ip address]
```

`[username]`是树莓派的用户名，`[ip address]`是树莓派的IP地址。例如：

```bash
ssh rpi@192.168.1.15
```

Windows，macOS，Linux三种操作系统均可以使用`arp -a`来扫描当前Wi-Fi下占用的所有IP地址。macOS用户可以在应用商店下载LanScan搜索树莓派的IP。也可以直接在树莓派上用`ifconfig`获取本机IP。

连接上树莓派之后，cd到存放此应用的地址，运行：

```bash
python app.py
```

如果成功运行，终端会显示开放的网址和端口。由于Web应用运行在`0.0.0.0:5000`，即对局域网内开放，因此可以直接访问`http://[ip address]:5000`。

## 使用说明

打开网页后，你将看到树莓派摄像头的实时画面，你可以点击Capture捕获当前画面，也可以点击Open...打开本机图片以上传。点击Analyse后，后端将调用CnOCR分析图片，并返回结果：一张在原图上用四边形框出文本区域的图片和对应的文字及置信度。效果如图：

![Demo](https://raw.githubusercontent.com/TsrmKumoko/OCRPi/main/Images/1.JPG)

## 存在的问题和改进方向

1. 无法在上传某张图片文件后取消并再次上传相同文件，初步判断是缓存问题。
2. 手写的识别准确率较低，可能需要用手写数据集再做训练。
3. 无法识别一些图片格式，例如HEIC。
