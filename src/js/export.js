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
    const animation = getById('export-animation').value
    const output = getById('export-path').value
    const duration = getDurationByAnimationName(animation)
    if (!duration || !output) return
    if (Number.isNaN(framerate) || framerate < 1 || framerate > 60) {
        framerate = format === 'MP4' ? 30 : 20
    }
    preload.sendExportOptions({format, framerate, animation, output, duration})
    getById('export-button').disabled = true
    getById('hide-export-box-button').disabled = true
    getById('export-progress').value = '0'
}

const selectExportPath = async () => {
    getById('export-path').value = await preload.selectExportPath()
}

const fillExportAnimations = (animations) => {
    availableAnimations = animations
    getById('export-animation').innerHTML = ''
    if (animations.length > 0) {
        animations.forEach(a => {
            const option = createTag('option')
            option.value = option.innerText = a.name
            getById('export-animation').append(option)
        })
    } else {
        const option = createTag('option')
        option.value = ''
        option.innerText = '--None--'
        getById('export-animation').append(option)
    }
}


// 监听接收可导出的动画
preload.onReceiveExportAnimations(fillExportAnimations)

// 监听导出完成
preload.onExportComplete(() => {
    getById('export-button').disabled = false
    getById('hide-export-box-button').disabled = false
    getById('export-progress').value = getById('export-progress').getAttribute('max')
    getById('progress-show').innerText = '完成'
})

preload.onSetExportProgress((data) => {
    switch (data.step) {
        case 0:
            frameNumber = data.frameNumber
            getById('export-progress').setAttribute('max', `${data.frameNumber + 1}`)
            getById('progress-show').innerText = `0/${data.frameNumber}`
            break
        case 1:
            getById('export-progress').value = `${data.frameIndex}`
            getById('progress-show').innerText = `${data.frameIndex}/${frameNumber}`
            break
        case 2:
            getById('progress-show').innerText = '合成中...'
            break
    }
})