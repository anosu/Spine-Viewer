// 全局变量缓存
let scene = getById('scene')
let fileInput = getById('fileInput')
let colorInput = getById('colorInput')
let zoomInput = getById('zoom')
let speedInput = getById('speed')
let mixInput = getById('default-mix')
let skinList = getById('skins')
let animationList = getById('animations')
let slotList = getById('slots')
let alphaMode = 1
let slotIndex = 0
let availableAnimations = []
let slots = []
let isExporting = false
let track = {current: 0}
let superposition = false
let currentSpeed = 1

// pixi.js app
const app = new PIXI.Application({
    resizeTo: scene,
    antialias: true,
    autoDensity: true,
    transparent: true,
    preserveDrawingBuffer: true,
    resolution: window.devicePixelRatio
});
// 未解决的问题：
// 设置overflow:hidden会导致缩放窗口画布闪烁
// 不设置会导致resizeTo不能正常工作
scene.appendChild(app.view);

const reload = () => {
    resetZoom()
    resetSpeed()
    app.loader.reset()
    app.stage.removeChildren()
    skinList.innerHTML = ''
    slotList.innerHTML = ''
    animationList.innerHTML = ''
    getById('animation-track0').click()
}

const loadFiles = (fileUrls) => {
    app.loader
        .reset()
        .add(fileUrls)
        .load(onLoaded);
}

// Spine加载函数
function onLoaded(loader, res) {
    const {skins, skeletons} = loadSkeletons()
    if (!skeletons) {
        alert('无效或者不支持的文件')
        return
    }
    if (superposition) {
        animationList.innerHTML = ''
    } else {
        slotIndex = 0
        skinList.innerHTML = ''
        slotList.innerHTML = ''
        animationList.innerHTML = ''
    }

    let existedSkins = Array.from(skinList.children).map(li => li.children[0].value)
    skins.forEach(s => {
        if (existedSkins.includes(s)) return
        const li = createTag('li')
        const label = createTag('label')
        const input = createTag('input')
        label.setAttribute('for', `skin-${s}`)
        input.setAttribute('id', `skin-${s}`)
        input.setAttribute('value', s)
        input.setAttribute('type', 'radio')
        input.setAttribute('name', 'skin')
        input.addEventListener('change', toggleSkin)
        input.classList.add('list-option')
        if (skinList.innerHTML === '') {
            input.checked = true
        }
        label.innerHTML += s
        li.append(input)
        li.append(label)
        skinList.append(li)
    })
    availableAnimations.forEach(a => {
        const li = createTag('li')
        const label = createTag('label')
        const span = createTag('span')
        const input = createTag('input')
        label.setAttribute('for', `animation-${a.name}`)
        input.setAttribute('id', `animation-${a.name}`)
        input.setAttribute('value', a.name)
        input.setAttribute('type', 'checkbox')
        input.setAttribute('name', 'animation')
        input.addEventListener('click', toggleAnimation)
        input.classList.add('list-option')
        span.innerText = a.duration + 's'
        label.innerHTML += a.name
        label.append(span)
        li.append(input)
        li.append(label)
        animationList.append(li)
    })
    skeletons.forEach(skeleton => {
        for (const slot of skeleton.skeleton.slots) {
            const li = createTag('li')
            const title = createTag('span')
            const div = createTag('div')
            const label = createTag('label')
            const input = createTag('input')
            const value = createTag('span')
            title.classList.add('slot-title')
            div.classList.add('slot-alpha')
            value.classList.add('slot-alpha-value')
            label.setAttribute('for', `${slotIndex}-${slot.data.name}`)
            input.setAttribute('id', `${slotIndex++}-${slot.data.name}`)
            input.setAttribute('type', 'range')
            input.setAttribute('name', 'slot')
            input.setAttribute('value', (slot.data.color.a * 100).toFixed())
            input.setAttribute('min', '0')
            input.setAttribute('max', '100')
            input.setAttribute('step', '1')
            title.innerText = slot.data.name
            label.innerText = 'Α:'
            value.innerText = slot.data.color.a.toFixed(2)
            div.append(label)
            div.append(input)
            div.append(value)
            li.append(title)
            li.append(div)
            input.addEventListener('input', () => {
                const alpha = +input.value / 100
                slot.color.a = alpha
                value.innerText = alpha.toFixed(2)
            })
            slotList.append(li)

            const slotData = {
                slot,
                inputTag: input,
                valueTag: value,
            }
            slots.push(slotData)
        }
    })
    if (!superposition) app.stage.removeChildren()
    skeletons.forEach(skeleton => app.stage.addChild(skeleton))

    function loadSkeletons() {
        if (!superposition) availableAnimations = []
        let skins = []
        let skeletons = []
        const speed = +speedInput.value
        const scale = +zoomInput.value / 100
        const defaultMix = +mixInput.value
        for (const key in res) {
            if (key.endsWith('skel') || key.endsWith('json')) {
                try {
                    res[key].spineAtlas.pages.forEach(p => p.baseTexture.alphaMode = alphaMode);
                    const skeleton = new PIXI.spine.Spine(res[key].spineData);
                    skeleton.position.set(app.view.clientWidth / 2, app.view.clientHeight / 2)
                    skeleton.scale.x = skeleton.scale.y = scale
                    skeleton.state.timeScale = speed
                    skeleton.state.data.defaultMix = defaultMix
                    skeleton.autoUpdate = true;
                    const skeletonSkins = skeleton.spineData.skins.map(s => s.name)
                    const skeletonAnimations = skeleton.spineData.animations.map(a => {
                        return {
                            name: a.name,
                            duration: a.duration.toFixed(3)
                        }
                    })
                    skins = skins.concat(skeletonSkins.filter(s => !skins.includes(s)))
                    // if (skins.length === 0) {
                    //     skins = skins.concat(skeletonSkins)
                    // } else {
                    //     const toRemove = []
                    //     for (const skin of skins) {
                    //         if (!skeletonSkins.map(s => s.name).includes(skin.name)) {
                    //             toRemove.push(skin.name)
                    //         }
                    //     }
                    //     skins = skins.filter(s => !toRemove.includes(s.name))
                    // }
                    if (availableAnimations.length === 0) {
                        availableAnimations = availableAnimations.concat(skeletonAnimations)
                    } else {
                        const toRemove = []
                        for (const animation of availableAnimations) {
                            if (!skeletonAnimations.map(a => a.name).includes(animation.name)) {
                                toRemove.push(animation.name)
                            }
                        }
                        availableAnimations = availableAnimations.filter(a => !toRemove.includes(a.name))
                    }
                    skeletons.push(skeleton)
                } catch (e) {
                    console.log('Load failed: ' + res[key])
                }
            }
        }
        return {skins, skeletons}
    }
}

// Spine动画对象修饰函数
function decorate(skeleton) {
    let isDragging = false;
    let mouseX, mouseY, deltaX, deltaY;
    app.view.addEventListener('pointerdown', (event) => {
        if (event.button === 0) {
            isDragging = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    });
    app.view.addEventListener('pointermove', (event) => {
        if (isDragging) {
            deltaX = event.clientX - mouseX;
            deltaY = event.clientY - mouseY;

            skeleton.x += deltaX;
            skeleton.y += deltaY;

            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    });
    app.view.addEventListener('pointerup', () => {
        isDragging = false;
    });
    app.view.addEventListener('pointerout', () => {
        isDragging = false;
    });

    app.view.addEventListener('wheel', (event) => {
        mouseScale(event, skeleton)

        function mouseScale(event, entity) {
            event.preventDefault();

            const originalScale = entity.scale.x
            const scaleFactor = event.deltaY > 0 ? 0.95 : 1.05; // 根据滚轮方向调整缩放比例
            const minScale = 0.1, maxScale = 5;
            const newScale = Math.min(Math.max(originalScale * scaleFactor, minScale), maxScale)

            entity.scale.x = entity.scale.y = newScale

            zoomInput.value = +newScale.toFixed(2) * 100
            getById('zoom-show').innerText = zoomInput.value + '%'

            entity.x -= (event.offsetX - entity.x) * (entity.scale.x / originalScale - 1);
            entity.y -= (event.offsetY - entity.y) * (entity.scale.y / originalScale - 1);
        }
    });

    return skeleton
}

// 回调函数
function toggleSkin(ev) {
    setSkin(ev.target.value)
    resetSlots()
}

function toggleAnimation(ev) {
    const animations = document.querySelectorAll('input[name="animation"]');
    if (ev.target.checked) {
        track[track.current] = ev.target.value
        animations.forEach(rb => {
            if (rb !== ev.target) {
                rb.checked = false
            }
        });
        playAnimation(track.current, ev.target.value, true)
    } else {
        track[track.current] = null
        clearAnimation(track.current)
    }
}

function openExportWindow() {
    isExporting = true
    preload.openExportWindow(availableAnimations)
}

async function exportAnimation(options) {
    const {format, framerate, animation, output, duration} = options
    const speed = +speedInput.value
    const delta = 1 / framerate
    const frameNumber = Math.floor(duration / speed / delta)

    let frameIndex = 0
    preload.sendExportProgress({step: 0, frameNumber})

    app.stage.children.forEach(a => a.autoUpdate = false)
    preload.prepareExport(animation).then(() => {
        for (let i = 1; i < 7; i++) {
            if (track[i]) {
                playAnimation(i, track[i], true)
            }
        }
        playAnimation(0, animation, false)
        app.stage.children.forEach(a => a.update(0))
        setTimeout(animate, 100)
    })

    async function animate() {
        if (frameIndex >= frameNumber) {
            preload.sendExportProgress({step: 2})
            preload.executeExport({format, framerate, animation, output})
            return
        }
        let data = app.view.toDataURL('image/png')
        preload.saveImage({
            index: String(frameIndex++).padStart(5, '0'),
            data
        }).then(() => {
            preload.sendExportProgress({step: 1, frameIndex})
            app.stage.children.forEach(a => a.update(delta))
            animate()
        })

    }
}