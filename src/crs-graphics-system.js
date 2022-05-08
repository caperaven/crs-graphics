import "./../node_modules/babylonjs/babylon.js"

export class GraphicsSystem {
    static async perform(step, context, process, item) {
        await this[step.action](step, context, process, item);
    }

    static async create(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);

        canvas.__engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
        canvas.__scenes = [];
        canvas.__lights = [];

        canvas.__resizeHandler = (() => {
            this.__engine.resize();
        }).bind(canvas);

        window.addEventListener("resize", canvas.__resizeHandler);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, canvas, context, process, item);
        }

        return canvas;
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        canvas.__engine.stopRenderLoop();

        window.removeEventListener("resize", canvas.__resizeHandler);

        canvas.__render_loop = null;
        canvas.__scenes = null;
        canvas.__engine = null;
        canvas.__camera = null;
        canvas.__lights = null;
        canvas.__resizeHandler = null;
    }

    static async set_render_loop(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        canvas.__render_loop = await crs.process.getValue(step.args.fn, context, process, item);

        if (canvas.__render_loop == null) {
            canvas.__render_loop = () => canvas.__scenes[0].render()
        }

        canvas.__engine.runRenderLoop(canvas.__render_loop);
    }

    static async add_scene(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        const scene = new BABYLON.Scene(canvas.__engine);
        canvas.__scenes.push(scene);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, scene, context, process, item);
        }

        return scene;
    }

    static async add_camera(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        const scene = (await crs.process.getValue(step.args.scene, context, process, item)) || canvas.__scenes[0];
        const name = (await crs.process.getValue(step.args.name, context, process, item)) || "camera";
        const x = (await crs.process.getValue(step.args.x, context, process, item)) || 0;
        const y = (await crs.process.getValue(step.args.y, context, process, item)) || 5;
        const z = (await crs.process.getValue(step.args.z, context, process, item)) || -10;
        const camera = new BABYLON.FreeCamera(name, location(x, y, z), scene);

        camera.setTarget(crs.intent.gfx.vec3.Zero());
        camera.attachControl(canvas)

        canvas.__camera = camera;

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, camera, context, process, item);
        }

        return camera;
    }

    static async add_light(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        const scene = (await crs.process.getValue(step.args.scene, context, process, item)) || canvas.__scenes[0];
        const name = (await crs.process.getValue(step.args.name, context, process, item)) || "light";
        const type = (await crs.process.getValue(step.args.type, context, process, item)) || crs.intent.gfx.lights.HEMI;
        const x = (await crs.process.getValue(step.args.x, context, process, item)) || 0;
        const y = (await crs.process.getValue(step.args.y, context, process, item)) || 1;
        const z = (await crs.process.getValue(step.args.z, context, process, item)) || 0;

        const light = new BABYLON[type](name, location(x, y, z), scene)
        canvas.__lights.push(light);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, light, context, process, item);
        }

        return light;
    }

    static async create_mesh(step, context, process, item) {
        const canvas = await crs.dom.get_element(step.args.element);
        const scene = (await crs.process.getValue(step.args.scene, context, process, item)) || canvas.__scenes[0];
        const options = await crs.process.getValue(step.args.options, context, process, item);
        const name = (await crs.process.getValue(step.args.name, context, process, item)) || "mesh";
        const type = (await crs.process.getValue(step.args.type, context, process, item)) || "Box";
        const x = await crs.process.getValue(step.args.x, context, process, item);
        const y = await crs.process.getValue(step.args.y, context, process, item);
        const z = await crs.process.getValue(step.args.z, context, process, item);

        const instance = BABYLON.MeshBuilder[`Create${type}`](name, options, scene);

        if (x != null) { instance.position.x = x; }
        if (y != null) { instance.position.y = y; }
        if (z != null) { instance.position.z = z; }

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, light, context, process, item);
        }

        return instance;
    }
}

function location(x, y, z) {
    return new BABYLON.Vector3(x, y, z)
}

crs.intent.gfx = GraphicsSystem;
crs.intent.gfx.lights = {
    HEMI: "HemisphericLight",
    POINT: "PointLight",
    DIRECTIONAL: "DirectionalLight",
    SPOT: "SpotLight"
}
crs.intent.gfx.vec2 = BABYLON.Vector2;
crs.intent.gfx.vec3 = BABYLON.Vector3;
crs.intent.gfx.vec4 = BABYLON.Vector4;

