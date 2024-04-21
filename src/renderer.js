// 全局变量缓存
let scene = getById('scene')
let fileInput = getById('fileInput')
let colorInput = getById('colorInput')
let zoomInput = getById('zoom')
let speedInput = getById('speed')
let mixInput = getById('mix')
let skinList = getById('skins')
let animationList = getById('animations')
let slotList = getById('slots')
let alphaMode = 1
let availableAnimations = []
let slots = []

// pixi.js app
const app = new PIXI.Application({
    resizeTo: scene,
    antialias: true,
    // transparent: true,
    backgroundColor: 0x616066,
    preserveDrawingBuffer: true,
});
// 未解决的问题：
// 设置overflow:hidden会导致缩放窗口画布闪烁
// 不设置会导致resizeTo不能正常工作
scene.appendChild(app.view);

const reload = () => {
    resetZoom()
    resetSpeed()
    app.loader.load(onLoaded)
}

const loadFiles = (fileUrls) => {
    app.loader
        .reset()
        .add(fileUrls)
        .load(onLoaded);
}

// Spine加载函数
function onLoaded(loader, res) {
    const {skins, skeletons, animations} = loadSkeletons()
    if (!skeletons) {
        alert('无效或者不支持的文件')
        return
    }
    skinList.innerHTML = ''
    slotList.innerHTML = ''
    animationList.innerHTML = ''
    getById('export-animation').innerHTML = ''

    skins.forEach(s => {
        const li = createTag('li')
        const label = createTag('label')
        const input = createTag('input')
        label.setAttribute('for', `skin-${s}`)
        input.setAttribute('id', `skin-${s}`)
        input.setAttribute('value', s)
        input.setAttribute('type', 'radio')
        input.setAttribute('name', 'skin')
        input.addEventListener('change', toggleSkin)
        if (skinList.innerHTML === '') {
            li.classList.add('selected')
            input.checked = true
        }
        label.innerHTML += s
        label.append(input)
        li.append(label)
        skinList.append(li)
    })
    animations.forEach(a => {
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
        span.innerText = a.duration + 's'
        label.innerHTML += a.name
        label.append(input)
        label.append(span)
        li.append(label)
        animationList.append(li)

        const option = createTag('option')
        option.value = option.innerText = a.name
        getById('export-animation').append(option)
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
            label.setAttribute('for', `${skeleton.spineData.hash}-${slot.data.name}`)
            input.setAttribute('id', `${skeleton.spineData.hash}-${slot.data.name}`)
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
                const alpha = parseInt(input.value) / 100
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
    availableAnimations = animations
    app.stage.removeChildren()
    skeletons.forEach(skeleton => app.stage.addChild(decorate(skeleton)))

    function loadSkeletons() {
        let skins = []
        let skeletons = []
        let animations = []
        const speed = parseFloat(speedInput.value)
        const scale = parseInt(zoomInput.value) / 100
        for (const key in res) {
            if (key.endsWith('skel') || key.endsWith('json')) {
                try {
                    res[key].spineAtlas.pages.forEach(p => p.baseTexture.alphaMode = alphaMode);
                    const skeleton = new PIXI.spine.Spine(res[key].spineData);
                    skeleton.position.set(app.renderer.width / 2, app.renderer.height / 2)
                    skeleton.scale.x = skeleton.scale.y = scale
                    skeleton.state.timeScale = speed
                    skeleton.autoUpdate = true;
                    const skeletonSkins = skeleton.spineData.skins.map(s => s.name)
                    const skeletonAnimations = skeleton.spineData.animations.map(a => {
                        return {
                            name: a.name,
                            duration: a.duration.toFixed(3)
                        }
                    })
                    if (skins.length === 0) {
                        skins = skins.concat(skeletonSkins)
                    } else {
                        const toRemove = []
                        for (const skin of skins) {
                            if (!skeletonSkins.map(s => s.name).includes(skin.name)) {
                                toRemove.push(skin.name)
                            }
                        }
                        skins = skins.filter(s => !toRemove.includes(s.name))
                    }
                    if (animations.length === 0) {
                        animations = animations.concat(skeletonAnimations)
                    } else {
                        const toRemove = []
                        for (const animation of animations) {
                            if (!skeletonAnimations.map(a => a.name).includes(animation.name)) {
                                toRemove.push(animation.name)
                            }
                        }
                        animations = animations.filter(a => !toRemove.includes(a.name))
                    }
                    skeletons.push(skeleton)
                } catch (e) {
                    console.log('Load failed: ' + res[key])
                }
            }
        }
        return {skins, skeletons, animations}
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

            zoomInput.value = parseFloat(newScale.toFixed(2)) * 100
            getById('zoom-show').innerText = zoomInput.value + '%'

            entity.x -= (event.offsetX - entity.x) * (entity.scale.x / originalScale - 1);
            entity.y -= (event.offsetY - entity.y) * (entity.scale.y / originalScale - 1);
        }
    });

    return skeleton
}

// 回调函数
function toggleSkin(ev) {
    const skins = document.querySelectorAll('input[name="skin"]');
    const li = ev.target.closest('li');
    if (ev.target.checked) {
        li.classList.add('selected');
        skins.forEach(rb => {
            if (rb !== ev.target) {
                const rli = rb.closest('li');
                rli.classList.remove('selected')
            }
        });
        setSkin(ev.target.value)
    }
}

function toggleAnimation(ev) {
    const animations = document.querySelectorAll('input[name="animation"]');
    const li = ev.target.closest('li');
    if (ev.target.checked) {
        li.classList.add('selected');
        animations.forEach(rb => {
            if (rb !== ev.target) {
                if (rb.checked) {
                    const rli = rb.closest('li');
                    rli.classList.remove('selected')
                    rb.checked = false
                }
            }
        });
        playAnimation(0, ev.target.value, true)
    } else {
        li.classList.remove('selected')
        pauseAnimation()
    }
}

const showExportBox = () => {
    getById('export-box').classList.remove('hide');
    getById('export-box').classList.add('show');
    getById('export-overlay').style.display = 'block';
}

const hideExportBox = () => {
    getById('export-box').classList.remove('show');
    getById('export-box').classList.add('hide');
    getById('export-overlay').style.display = 'none';
}

const getDurationByAnimationName = (name) => {
    for (const a of availableAnimations) {
        if (a.name === name) {
            return parseFloat(a.duration)
        }
    }
    return 0
}

async function exportAnimation() {
    const format = getById('export-format').value
    let framerate = parseInt(getById('export-framerate').value)
    const animation = getById('export-animation').value
    const output = getById('export-path').value
    const duration = getDurationByAnimationName(animation)
    if (!duration || !output) return
    if (Number.isNaN(framerate) || framerate < 1 || framerate > 60) {
        framerate = format === 'MP4' ? 30 : 20
    }
    const speed = parseFloat(speedInput.value)
    const delta = 1 / framerate
    const frameNumber = Math.floor(duration / speed / delta)

    let frameIndex = 0
    getById('export-progress').value = '0'
    getById('export-progress').setAttribute('max', `${frameNumber + 1}`)
    getById('progress-show').innerText = `0/${frameNumber}`
    getById('export-button').disabled = true
    getById('hide-export-box-button').disabled = true
    app.stage.children.forEach(a => a.autoUpdate = false)

    await preload.prepareExport(animation)
    playAnimation(0, animation, false)
    app.stage.children.forEach(a => a.update(0))
    setTimeout(animate, 100)

    async function animate() {
        if (frameIndex >= frameNumber) {
            getById('progress-show').innerText = '合成中...'
            preload.executeExport({format, framerate, animation, output})
            return
        }
        let data = app.view.toDataURL('image/png')
        let result = await preload.saveImage({
            index: String(frameIndex++).padStart(5, '0'),
            data
        })
        if (result) {
            getById('export-progress').value = `${frameIndex}`
            getById('progress-show').innerText = `${frameIndex}/${frameNumber}`
            app.stage.children.forEach(a => a.update(delta))
            animate()
        } else {
            getById('export-button').disabled = false
            getById('hide-export-box-button').disabled = false
            getById('export-progress').value = 0
            getById('progress-show').innerText = 'Error'
            app.stage.children.forEach(a => a.autoUpdate = false)
        }
    }
}

const selectExportPath = async () => {
    getById('export-path').value = await preload.selectExportPath()
}