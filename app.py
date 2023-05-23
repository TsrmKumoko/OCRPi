import os
import cv2
import base64
import numpy as np
from cnocr import CnOcr
from time import sleep
from flask import Flask, render_template, Response, request, jsonify

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

video_stream_enabled = True

# 读取图像并将其转换为Base64编码的字符串
def img_to_base64(img_path):
    with open(img_path, 'rb') as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

# 生成器函数，用于获取摄像头数据
def generate_frames():
    global video_stream_enabled
    cap = cv2.VideoCapture(0)

    while True:
        if video_stream_enabled:
            success, frame = cap.read()
            if not success:
                break
            else:
                _, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            sleep(0.1)

    cap.release()

# 检测并标注文字所在位置
def analyse_image_cnocr():
    image_path = './images/input.jpg'
    reader = CnOcr()
    result = reader.ocr(image_path)
    print(result)

    image = cv2.imread(image_path)
    font = cv2.FONT_HERSHEY_SIMPLEX

    counter = 0
    data_list = []
    for block in result:
        counter += 1

        # Get info for one block
        points = block['position'].astype(np.int32)
        top_left = points[0]
        text = block['text']
        acc = block['score']
        data_list.append([text, acc])
        
        # Get text size
        (text_width, text_height), _ = cv2.getTextSize(str(counter), font, 0.5, 1)
        text_x = top_left[0] - text_width - 5
        text_y = top_left[1] + text_height + 2
        
        # Draw border and number
        image = cv2.polylines(image, [points], isClosed=True, color=(0, 255, 0), thickness=2)
        image = cv2.rectangle(image, top_left, (text_x-5, text_y+4), (0,255,0), -1)
        image = cv2.putText(image, str(counter), (text_x, text_y), font, 0.5, (0,0,0), 1, cv2.LINE_AA)

    cv2.imwrite('./images/result.jpg', image)

    counter = 0
    result_list = []
    for data in data_list:
        counter += 1
        result_list.append(f'{counter}: {data[0]}, {round(data[1], 3)}')

    return result_list

@app.route('/')
def index():
    return render_template('index.html')

# 用于流式传输的路由
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), content_type='multipart/x-mixed-replace; boundary=frame')

# 切换视频流状态
@app.route('/set_video_stream', methods=['POST'])
def set_video_stream():
    global video_stream_enabled
    video_stream_enabled = request.get_json()['enabled']
    return jsonify({'status': 'success'})

@app.route('/save_image', methods=['POST'])
def save_image():
    image_data = request.get_json()['image_data']
    image_data = base64.b64decode(image_data.split(',')[-1])

    image_path = os.path.join('images', 'input.jpg')
    with open(image_path, 'wb') as image_file:
        image_file.write(image_data)

    return jsonify({'status': 'success'})

# 分析图片路由
@app.route('/analyse_image', methods=['GET'])
def analyse_image_route():
    result = analyse_image_cnocr()
    return jsonify(result)

@app.route('/result_image')
def show_result_image():
    result_image_path = './images/result.jpg'
    encoded_image = img_to_base64(result_image_path)
    return jsonify({'image': encoded_image})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)