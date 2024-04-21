// 事件监听

// 监听拖拽文件
getById('main').addEventListener('dragover', (ev) => {
    ev.preventDefault()
    getById('mask').style.display = 'flex'
})

getById('mask').addEventListener('dragleave', (ev) => {
    ev.preventDefault()
    getById('mask').style.display = 'none'
})

getById('main').addEventListener('drop', async (ev) => {
    ev.preventDefault()
    getById('mask').style.display = 'none'
    const filePaths = Array.from(ev.dataTransfer.files).map(f => f.path).filter(p => p.endsWith('skel') || p.endsWith('json'))
    if (filePaths.length > 0) {
        const fileUrls = await getUrlsByPaths(filePaths)
        window.fileUrls = fileUrls
        loadFiles(fileUrls)
    }
})

// 监听选择文件
fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
        let filePaths = Array.from(fileInput.files).map(f => f.path)
        let fileUrls = await getUrlsByPaths(filePaths)
        window.fileUrls = fileUrls
        loadFiles(fileUrls)
    }
})

// 监听选择背景色
colorInput.addEventListener('input', () => {
    app.renderer.backgroundColor = parseInt(colorInput.value.slice(1), 16)
})

// 监听窗口大小改变
let resizeTimer, resizeTimer2;
const sceneObserver = new ResizeObserver(entries => {
    clearTimeout(resizeTimer)
    clearTimeout(resizeTimer2)
    app.view.style.opacity = '0'
    getById('resolution').style.display = 'block'
    getById('resolution-width').innerText = app.renderer.width
    getById('resolution-height').innerText = app.renderer.height
    resizeTimer = setTimeout(() => {
        getById('resolution').style.display = 'none'
    }, 1500)
    resizeTimer2 = setTimeout(() => {
        app.view.style.opacity = '1'
    }, 100)
});
sceneObserver.observe(scene);

// 监听选择AlphaMode
const alphaModeOptions = document.querySelectorAll('input[name="alpha-mode"]')
alphaModeOptions.forEach((radio) => {
    radio.addEventListener('click', (ev) => {
        if (ev.target.checked) {
            alphaMode = parseInt(ev.target.value)
            setAlphaMode(alphaMode)
            getById(ev.target.id + '-label').classList.add('checked')
            alphaModeOptions.forEach(option => {
                if (option !== ev.target) {
                    getById(option.id + '-label').classList.remove('checked')
                }
            })
        }
    })
})

// 监听缩放滑块
zoomInput.addEventListener('input', () => {
    let scale = parseInt(zoomInput.value) / 100
    setZoom(scale)
    getById('zoom-show').innerText = zoomInput.value + '%'
})

// 监听速度滑块
speedInput.addEventListener('input', () => {
    let speed = parseFloat(speedInput.value)
    setSpeed(speed)
    getById('speed-show').innerText = parseFloat(speedInput.value).toFixed(2) + 'x'
})

// mixInput.addEventListener('input', () => {
//     let mix = parseFloat(mixInput.value)
//     setMix(mix)
//     mixShow.innerText = parseFloat(mixInput.value).toFixed(1) + 's'
// })

getById('export-overlay').addEventListener('click', () => {
    getById('hide-export-box-button').click()
})


// 监听右键菜单
scene.addEventListener('contextmenu', (ev) => {
    ev.preventDefault()
    preload.showContextMenu(ev)
})

preload.onCopyImage(() => {
    app.view.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
    })
})

// 监听窗口最大化的切换
preload.onMaximize(() => {
    getById('maximize-icon').innerText = '❐'
})

preload.onUnMaximize(() => {
    getById('maximize-icon').innerText = '▢'
})

preload.onExportComplete(() => {
    getById('export-button').disabled = false
    getById('hide-export-box-button').disabled = false
    getById('export-progress').value = getById('export-progress').getAttribute('max')
    getById('progress-show').innerText = '完成'
    app.stage.children.forEach(a => a.autoUpdate = true)
})

preload.onDebug(console.log)