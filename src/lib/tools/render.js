import { Vector2 } from "three"


const size = new Vector2();
function matrixRender(viewport, renderer, dt) {
    renderer.getSize(size);

    renderer.setScissorTest(true);
    const height = size.y / viewport.length;
    viewport.forEach((row, j) => {
        const width = size.x / row.length;
        row.forEach((row, k) => {
            const x = k * width;
            const y = (viewport.length - j - 1) * height;
            renderer.setViewport(x, y, width, height);
            renderer.setScissor(x, y, width, height);
            row.render(dt);
        });
    });
    renderer.setScissorTest(false);
}

export { matrixRender }