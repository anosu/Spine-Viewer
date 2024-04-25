// spine操作函数
const setZoom = (scale) => {
    app.stage.children.forEach(a => {
        a.scale.x = a.scale.y = scale
    })
}

const resetZoom = () => {
    setZoom(1)
    zoomInput.value = 100
    getById('zoom-show').innerText = '100%'
}

const setSpeed = (speed) => {
    app.stage.children.forEach(a => {
        a.state.timeScale = speed
    })
}

const resetSpeed = () => {
    setSpeed(1)
    speedInput.value = 1
    getById('speed-show').innerText = '1.00x'
}


const setMix = (mix) => {
    app.stage.children.forEach(a => {
        a.state.data.defaultMix = mix
    })
}

const resetMix = () => {
    setMix(0)
    mixInput.value = 0
    getById('default-mix-show').innerText = '0.0s'
}

const setAlphaMode = (mode) => {
    app.renderer.texture.managedTextures.forEach(t => {
        t.alphaMode = mode
        t.update()
    })
}


const setSkin = (skin) => {
    app.stage.children.forEach(a => {
        if (a.skeleton.data.skins.some(s => s.name === skin)) {
            a.skeleton.setSkinByName(skin)
            a.skeleton.setSlotsToSetupPose()
        }
    })
}

const resetPosition = () => {
    app.stage.children.forEach(a => a.position.set(scene.clientWidth / 2, scene.clientHeight / 2))
}

const playAnimation = (track, animation, loop) => {
    app.stage.children.forEach(a => {
        a.state.timeScale = +speedInput.value
        a.state.setAnimation(track, animation, loop)
    })
}

const clearAnimation = (trackIndex) => {
    app.stage.children.forEach(a => a.state.setEmptyAnimation(trackIndex))
}

const pauseAnimation = () => {
    const speed = speedInput.value
    if (currentSpeed.toString() === speed) {
        setSpeed(0)
        speedInput.value = 0
        getById('speed-show').innerText = '0.00x'
    } else {
        setSpeed(currentSpeed)
        speedInput.value = currentSpeed
        getById('speed-show').innerText = currentSpeed.toFixed(2) + 'x'
    }
}

const resetSlots = () => {
    // app.stage.children.forEach(a => a.skeleton.setSlotsToSetupPose())
    slots.forEach(sd => {
        sd.slot.color.a = sd.slot.data.color.a
        sd.inputTag.value = (sd.slot.data.color.a * 100).toFixed()
        sd.valueTag.innerText = sd.slot.data.color.a.toFixed(2)
    })
}