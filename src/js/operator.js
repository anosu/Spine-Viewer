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

const playAnimation = (track, animation, loop) => {
    app.stage.children.forEach(a => {
        a.state.timeScale = +speedInput.value
        a.state.setAnimation(track, animation, loop)
    })
}

const pauseAnimation = (trackIndex) => {
    let noTrack = true
    for (let i = 0; i < 7; i++) {
        noTrack &&= !track[i]
    }
    if (noTrack) {
        app.stage.children.forEach(a => a.state.tracks = [])
    } else {
        app.stage.children.forEach(a => a.state.setEmptyAnimation(trackIndex))
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