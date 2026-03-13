/* eslint-disable */
import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default mxRc_threeModel;

function mxRc_threeModel(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth || 0;
    this.threeContext = null;
}

mxUtils.extend(mxRc_threeModel, mxShape);
mxRc_threeModel.prototype.cst = {
    SHAPE_NAME: "mxgraph.rc.mxRc_threeModel",
};

mxRc_threeModel.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};

mxRc_threeModel.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = `three_${this.state.cell.id}`;
        const graph = this.state.view.graph;
        cell.setAttribute("divId", divId);

        const htmlStr = `
            <div id="${divId}" 
                style="width: ${w}px;height: ${h}px;
                       position:relative;
                       background:#f0f0f0;
                       overflow: visible;
                       pointer-events: auto;">
                <div class="loading" style="position:absolute;top:10px;left:10px;padding:8px;background:rgba(255,255,255,0.9);display:none; pointer-events: none;">
                    Loading...
                </div>
                <div class="error" style="position:absolute;top:10px;left:10px;padding:8px;background:rgba(255,0,0,0.9);color:white;display:none; pointer-events: none;">
                    Load Error!
                </div>
            </div>
        `;

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, "html", 0, 0, 0);

        this.initThree(divId, w, h);
    }
};

mxRc_threeModel.prototype.initThree = function (divId, w, h) {
    const container = document.getElementById(divId);
    if (!container) return;

    this.threeContext = {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, w / h, 0.1, 1000),
        renderer: new THREE.WebGLRenderer({ antialias: true }),
        animationFrameId: null,
        controls: null,
    };

    const { scene, camera, renderer } = this.threeContext;

    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    this.threeContext.controls = new OrbitControls(camera, container);
    this.threeContext.controls.target.set(0, 0, 0);
    this.threeContext.controls.update();

    // 阻止页面滚动相关事件
    const rendererDom = renderer.domElement;
    const preventScrollEvents = ['wheel', 'mousedown', 'touchmove'];
    preventScrollEvents.forEach((eventType) => {
        rendererDom.addEventListener(eventType, (e) => {
            e.preventDefault();
        }, { passive: false });
    });

    // 添加基础灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 相机设置
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // 加载模型
    this.loadModel(scene, container, () => {
        // 启动动画循环
        const animate = () => {
            this.threeContext.animationFrameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
            if (this.threeContext.controls) {
                this.threeContext.controls.update();
            }
        };
        animate();

        // 窗口大小调整处理
        container.addEventListener("resize", () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            if (this.threeContext.controls) {
                this.threeContext.controls.handleResize();
            }
        });
    });
};

mxRc_threeModel.prototype.loadModel = function (scene, container, onLoaded) {
    const loadingEl = container.querySelector(".loading");
    const errorEl = container.querySelector(".error");

    // 显示加载状态
    loadingEl.style.display = "block";
    errorEl.style.display = "none";

    // 替换为实际模型路径
    const modelPath = "/assets/models/hospital-building-cutaway-with-characters.glb";

    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            loadingEl.style.display = "none";
            scene.add(gltf.scene);

            // 调整模型缩放（根据实际模型尺寸调整）
            if (gltf.scene) {
                gltf.scene.scale.set(0.3, 0.3, 0.3); // 示例缩放，可调整
            }

            // 设置模型引用
            this.model = gltf.scene;

            // 设置交互
            this.setupModelInteraction(
                gltf.scene,
                scene,
                this.threeContext.camera,
                this.threeContext.renderer
            );

            onLoaded();
        },
        (xhr) => {
            // 加载进度回调（调试用）
            console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (err) => {
            console.error("Model load error:", err);
            loadingEl.style.display = "none";
            errorEl.style.display = "block";
        }
    );
};

mxRc_threeModel.prototype.setupModelInteraction = function (model, scene, camera, renderer) {
    if (!camera || !renderer) {
        console.error("Camera or Renderer not defined!");
        return;
    }

    // 实现模型点击交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener("click", (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
            this.handleModelClick(intersects[0]);
        }
    });
};

mxRc_threeModel.prototype.handleModelClick = function (intersect) {
    console.log("Model clicked:", intersect);
    // 触发自定义事件或更新单元格属性
};

// 样式配置处理
mxRc_threeModel.prototype.applyStyle = function () {
    const scale = this.style.scale || 1;
    const position = this.style.position || { x: 0, y: 0, z: 0 };

    if (this.model) {
        this.model.scale.set(scale, scale, scale);
        this.model.position.set(position.x, position.y, position.z);
    }
};
