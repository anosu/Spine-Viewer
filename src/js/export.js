let progress = getById('export-progress')
let progressShow = getById('progress-show')
let exportAnimationList = getById('export-animation')
let frameNumber = 0
let availableAnimations = [];

const getDurationByAnimationName = (name) => {
    for (const a of availableAnimations) {
        if (a.name === name) {
            return parseFloat(a.duration)
        }
    }
    return 0
}

const getExportOptions = () => {
    const format = getById('export-format').value
    let framerate = parseInt(getById('export-framerate').value)
    const animation = exportAnimationList.value
    const output = getById('export-path').value
    const duration = getDurationByAnimationName(animation)
    if (!duration || !output) return
    if (Number.isNaN(framerate) || framerate < 1 || framerate > 60) {
        framerate = format === 'MP4' ? 30 : 20
    }
    preload.sendExportOptions({format, framerate, animation, output, duration})
    getById('export-button').disabled = true
    getById('hide-export-box-button').disabled = true
    progress.value = '0'
}

const selectExportPath = async () => {
    getById('export-path').value = await preload.selectExportPath()
}

const fillExportAnimations = (animations) => {
    availableAnimations = animations
    exportAnimationList.innerHTML = ''
    if (animations.length > 0) {
        animations.forEach(a => {
            const option = createTag('option')
            option.value = option.innerText = a.name
            exportAnimationList.append(option)
        })
    } else {
        const option = createTag('option')
        option.value = ''
        option.innerText = '--None--'
        exportAnimationList.append(option)
    }
}


// 监听接收可导出的动画
preload.onReceiveExportAnimations((animations) => {
    progressShow.innerText = '0/0'
    progress.value = '0'
    fillExportAnimations(animations)
})

// 监听导出完成
preload.onExportComplete(() => {
    getById('export-button').disabled = false
    getById('hide-export-box-button').disabled = false
    progress.value = progress.getAttribute('max')
    progressShow.innerText = '完成'
})

preload.onSetExportProgress((data) => {
    switch (data.step) {
        case 0:
            frameNumber = data.frameNumber
            progress.setAttribute('max', `${data.frameNumber + 1}`)
            progressShow.innerText = `0/${data.frameNumber}`
            break
        case 1:
            progress.value = `${data.frameIndex}`
            progressShow.innerText = `${data.frameIndex}/${frameNumber}`
            break
        case 2:
            progressShow.innerText = '合成中...'
            break
    }
})