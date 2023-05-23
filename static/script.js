document.getElementById("capture-btn").addEventListener("click", async function() {
    const video = document.getElementById("video-stream");
    const canvas = document.getElementById("capture-canvas");
    const capturedImage = document.getElementById("static-image");

    // 将视频帧绘制到canvas上
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 获取canvas的Base64编码数据
    const imageData = canvas.toDataURL("image/jpeg");

    // 在页面上显示截取的图片
    capturedImage.src = imageData;
    capturedImage.style.display = "inline";
    video.style.display = "none";
    await set_video_stream(false);

    // 隐藏 Capture 按钮, 显示OK和Cancel按钮
    this.style.display = "none";
    document.getElementById("open-btn").style.display = "none";
    document.getElementById("ok-btn").style.display = "inline";
    document.getElementById("cancel-btn").style.display = "inline";

    // log区域新增文本
    const newText = document.createElement("div");
    newText.innerText = "Captured.";
    document.getElementById("result").appendChild(newText);
    const resultDiv = document.getElementById("result");
    resultDiv.scrollTop = resultDiv.scrollHeight;
});

document.getElementById("ok-btn").addEventListener("click", async function() {
    // 禁用按钮
    setButtonsEnabled(false);

    // log区域新增文本
    const newText = document.createElement("div");
    newText.innerText = "Analysing... This step may take a minute or longer...";
    document.getElementById("result").appendChild(newText);
    const resultDiv = document.getElementById("result");
    resultDiv.scrollTop = resultDiv.scrollHeight;

    // 发送图片数据到服务器
    const capturedImage = document.getElementById("static-image");
    const imageData = capturedImage.src;
    await fetch("/save_image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({image_data: imageData})
    });

    let response = await fetch("/analyse_image", {
        method: "GET"
    });

    const result = await response.json();

    // log区域新增分析结果
    result.forEach(text => {
        const resultText = document.createElement("div");
        resultText.innerText = text;
        document.getElementById("result").appendChild(resultText);
    });
    resultDiv.scrollTop = resultDiv.scrollHeight;

    response = await fetch("/result_image");
    const data = await response.json();
    const encodedImage = data.image;
    document.getElementById("static-image").src = "data:image/jpeg;base64," + encodedImage;

    // 启用按钮
    setButtonsEnabled(true);

    // 隐藏Analyse按钮
    document.getElementById("ok-btn").style.display = "none"
});

document.getElementById("cancel-btn").addEventListener("click", async function () {
    // Hide the captured frame
    document.getElementById("static-image").style.display = "none"
  
    // Show the video, capture, and open buttons
    await set_video_stream(true);
    document.getElementById("video-stream").style.display = "inline";
    document.getElementById("capture-btn").style.display = "inline";
    document.getElementById("open-btn").style.display = "inline";
  
    // Hide the OK and Cancel buttons
    document.getElementById("ok-btn").style.display = "none";
    document.getElementById("cancel-btn").style.display = "none";

    // log区域新增文本
    let newText = document.createElement("div");
    newText.innerText = "Ready.";
    document.getElementById("result").appendChild(newText);
    newText = document.createElement("div");
    newText.innerText = "Capture a photo or open a local picture.";
    document.getElementById("result").appendChild(newText);
    const resultDiv = document.getElementById("result");
    resultDiv.scrollTop = resultDiv.scrollHeight;
});

document.getElementById("open-btn").addEventListener("click", async function () {
    document.getElementById("file-input").click();
})

document.getElementById("file-input").addEventListener("change", async function() {
    const file = this.files[0];
    if (!file) {
        return;
    }

    // log区域新增文本
    const newText = document.createElement("div");
    newText.innerText = "Image file opened.";
    document.getElementById("result").appendChild(newText);
    const resultDiv = document.getElementById("result");
    resultDiv.scrollTop = resultDiv.scrollHeight;

    // 读取文件并在static-image上预览
    const reader = new FileReader();
    reader.onloadend = function() {
        const imageData = reader.result;
        const capturedImage = document.getElementById("static-image");
        capturedImage.src = imageData;
        capturedImage.style.display = "inline";
    }
    reader.readAsDataURL(file);

    // 隐藏视频流和Capture，Open按钮
    await set_video_stream(false);
    document.getElementById("video-stream").style.display = "none";
    document.getElementById("capture-btn").style.display = "none";
    document.getElementById("open-btn").style.display = "none";

    // 显示OK和Cancel按钮
    document.getElementById("ok-btn").style.display = "inline";
    document.getElementById("cancel-btn").style.display = "inline";
});

async function set_video_stream(enabled) {
    await fetch("/set_video_stream", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ enabled: enabled })
    });
}

function setButtonsEnabled(enabled) {
    const okButton = document.getElementById("ok-btn");
    const backButton = document.getElementById("cancel-btn");
    okButton.disabled = !enabled;
    backButton.disabled = !enabled;
}
