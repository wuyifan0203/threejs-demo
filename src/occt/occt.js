import {
    Mesh,
    MeshNormalMaterial,
    BufferGeometry,
    Float32BufferAttribute,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize
} from '../lib/tools/index.js';
import { initOpenCascade } from '../lib/other/opencascade/index.js'
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';


let occ = null;
let occH = null;
window.onload = async () => {
    try {
        occ = await initOpenCascade();
        console.log('occ: ', occ);
        occH = new OpenCascadeHelper(occ);
        init();
    } catch (error) {
        console.error('初始化失败:', error);
    }
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0x000000);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BufferGeometry(), new MeshNormalMaterial());
    scene.add(mesh);

    const params = {
        width: 5,
        thickness: 3,
        height: 7
    }

    function update() {
        const bottle = makeBottle(params.width, params.thickness, params.height);
        const { position, normal } = occH.convertBuffer(bottle);
        mesh.geometry.dispose();
        mesh.geometry = new BufferGeometry();
        mesh.geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        mesh.geometry.setAttribute('normal', new Float32BufferAttribute(normal, 3));
    }
    update();

    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(params, 'width', 2, 10, 1).onFinishChange(update);
    gui.add(params, 'height', 2, 15, 1).onFinishChange(update);
    gui.add(params, 'thickness', 2, 10, 1).onFinishChange(update);
    gui.add(mesh.material, 'wireframe')
}

function makeBottle(width, thickness, height) {
    const [hw, qt] = [width / 2, thickness / 4];
    // Profile : Define Support Points
    const aPnt1 = new occ.gp_Pnt(-hw, 0, 0);
    const aPnt2 = new occ.gp_Pnt(-hw, -qt, 0);
    const aPnt3 = new occ.gp_Pnt(0, -thickness / 2., 0);
    const aPnt4 = new occ.gp_Pnt(hw, -qt, 0);
    const aPnt5 = new occ.gp_Pnt(hw, 0, 0);

    // Profile : Define the Geometry
    const anArcOfCircle = new occ.GC_MakeArcOfCircle(aPnt2, aPnt3, aPnt4);
    const aSegment1 = new occ.GC_MakeSegment(aPnt1, aPnt2);
    const aSegment2 = new occ.GC_MakeSegment(aPnt4, aPnt5);

    // Profile : Define the Topology
    const anEdge1 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom_Curve(aSegment1.Value().get()));
    const anEdge2 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom_Curve(anArcOfCircle.Value().get()));
    const anEdge3 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom_Curve(aSegment2.Value().get()));
    const aWire = new occ.BRepBuilderAPI_MakeWire(anEdge1.Edge(), anEdge2.Edge(), anEdge3.Edge());

    // Complete Profile
    const xAxis = occ.gp.prototype.OX();
    const aTrsf = new occ.gp_Trsf();

    aTrsf.SetMirror(xAxis);
    const aBRepTrsf = new occ.BRepBuilderAPI_Transform(aWire.Wire(), aTrsf, false);
    const aMirroredShape = aBRepTrsf.Shape();

    const mkWire = new occ.BRepBuilderAPI_MakeWire();
    mkWire.Add(aWire.Wire());
    mkWire.Add(occ.TopoDS.prototype.Wire(aMirroredShape));
    const myWireProfile = mkWire.Wire();

    // Body : Prism the Profile
    const myFaceProfile = new occ.BRepBuilderAPI_MakeFace(myWireProfile);
    const aPrismVec = new occ.gp_Vec(0, 0, height);
    let myBody = new occ.BRepPrimAPI_MakePrism(myFaceProfile.Face(), aPrismVec, false, true);

    // Body : Apply Fillets
    const mkFillet = new occ.BRepFilletAPI_MakeFillet(myBody.Shape());
    const anEdgeExplorer = new occ.TopExp_Explorer(myBody.Shape(), occ.TopAbs_EDGE, occ.TopAbs_SHAPE);
    anEdgeExplorer.Init(myBody.Shape(), occ.TopAbs_EDGE, occ.TopAbs_SHAPE);
    while (anEdgeExplorer.More()) {
        console.log('anEdgeExplorer.More()',anEdgeExplorer.More());
        const anEdge = occ.TopoDS.prototype.Edge(anEdgeExplorer.Current());
        console.log('anEdge: ', anEdge);
        // Add edge to fillet algorithm
        // mkFillet.Add(thickness / 12., anEdge);
        anEdgeExplorer.Next();
    }
    debugger
    myBody = mkFillet.Shape();

    // Body : Add the Neck
    const neckLocation = new occ.gp_Pnt(0, 0, height);
    const neckAxis = occ.gp.DZ();
    const neckAx2 = new occ.gp_Ax2(neckLocation, neckAxis);

    const myNeckRadius = qt;
    const myNeckHeight = height / 10.;

    const MKCylinder = new occ.BRepPrimAPI_MakeCylinder(neckAx2, myNeckRadius, myNeckHeight);
    const myNeck = MKCylinder.Shape();

    myBody = new occ.BRepAlgoAPI_Fuse(myBody, myNeck, new occ.Message_ProgressRange());

    // Body : Create a Hollowed Solid
    let faceToRemove;
    let zMax = -1;
    const aFaceExplorer = new occ.TopExp_Explorer(myBody.Shape(), occ.TopAbs_ShapeEnum.TopAbs_FACE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
    for (; aFaceExplorer.More(); aFaceExplorer.Next()) {
        const aFace = occ.TopoDS.Face(aFaceExplorer.Current());
        // Check if <aFace> is the top face of the bottle's neck 
        const aSurface = occ.BRep_Tool.Surface(aFace);
        if (aSurface.get().$$.ptrType.name === "Geom_Plane*") {
            const aPlane = new occ.Handle_Geom_Plane(aSurface.get()).get();
            const aPnt = aPlane.Location();
            const aZ = aPnt.Z();
            if (aZ > zMax) {
                zMax = aZ;
                faceToRemove = new occ.TopExp_Explorer(aFace, occ.TopAbs_ShapeEnum.TopAbs_FACE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE).Current();
            }
        }
    }

    const facesToRemove = new occ.TopTools_ListOfShape();
    facesToRemove.Append(faceToRemove);
    const s = myBody.Shape();
    myBody = new occ.BRepOffsetAPI_MakeThickSolid();
    myBody.MakeThickSolidByJoin(s, facesToRemove, -thickness / 50, 1.e-3, occ.BRepOffset_Mode.BRepOffset_Skin, false, false, occ.GeomAbs_JoinType.GeomAbs_Arc, false, new occ.Message_ProgressRange_1());
    // Threading : Create Surfaces
    const aCyl1 = new occ.Geom_CylindricalSurface(new occ.gp_Ax3(neckAx2), myNeckRadius * 0.99);
    const aCyl2 = new occ.Geom_CylindricalSurface(new occ.gp_Ax3(neckAx2), myNeckRadius * 1.05);

    // Threading : Define 2D Curves
    const aPnt = new occ.gp_Pnt2d(2. * Math.PI, myNeckHeight / 2.);
    const aDir = new occ.gp_Dir2d(2. * Math.PI, myNeckHeight / 4.);
    const anAx2d = new occ.gp_Ax2d(aPnt, aDir);

    const aMajor = 2. * Math.PI;
    const aMinor = myNeckHeight / 10;

    const anEllipse1 = new occ.Geom2d_Ellipse(anAx2d, aMajor, aMinor, true);
    const anEllipse2 = new occ.Geom2d_Ellipse(anAx2d, aMajor, aMinor / 4, true);
    const anArc1 = new occ.Geom2d_TrimmedCurve(new occ.Handle_Geom2d_Curve(anEllipse1), 0, Math.PI, true, true);
    const anArc2 = new occ.Geom2d_TrimmedCurve(new occ.Handle_Geom2d_Curve(anEllipse2), 0, Math.PI, true, true);
    const tmp1 = anEllipse1.Value(0);
    const anEllipsePnt1 = new occ.gp_Pnt2d(tmp1.X(), tmp1.Y());
    const tmp2 = anEllipse1.Value(Math.PI);
    const anEllipsePnt2 = new occ.gp_Pnt2d(tmp2.X(), tmp2.Y());

    const aSegment = new occ.GCE2d_MakeSegment(anEllipsePnt1, anEllipsePnt2);
    // Threading : Build Edges and Wires
    const anEdge1OnSurf1 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom2d_Curve(anArc1), new occ.Handle_Geom_Surface(aCyl1));
    const anEdge2OnSurf1 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom2d_Curve(aSegment.Value().get()), new occ.Handle_Geom_Surface(aCyl1));
    const anEdge1OnSurf2 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom2d_Curve(anArc2), new occ.Handle_Geom_Surface(aCyl2));
    const anEdge2OnSurf2 = new occ.BRepBuilderAPI_MakeEdge(new occ.Handle_Geom2d_Curve(aSegment.Value().get()), new occ.Handle_Geom_Surface(aCyl2));
    const threadingWire1 = new occ.BRepBuilderAPI_MakeWire(anEdge1OnSurf1.Edge(), anEdge2OnSurf1.Edge());
    const threadingWire2 = new occ.BRepBuilderAPI_MakeWire(anEdge1OnSurf2.Edge(), anEdge2OnSurf2.Edge());
    occ.BRepLib.BuildCurves3d(threadingWire1.Wire());
    occ.BRepLib.BuildCurves3d(threadingWire2.Wire());
    occ.BRepLib.BuildCurves3d(threadingWire1.Wire());
    occ.BRepLib.BuildCurves3d(threadingWire2.Wire());

    // Create Threading 
    const aTool = new occ.BRepOffsetAPI_ThruSections(true, false, 1.0e-06);
    aTool.AddWire(threadingWire1.Wire());
    aTool.AddWire(threadingWire2.Wire());
    aTool.CheckCompatibility(false);

    const myThreading = aTool.Shape();

    // Building the Resulting Compound 
    const aRes = new occ.TopoDS_Compound();
    const aBuilder = new occ.BRep_Builder();
    aBuilder.MakeCompound(aRes);
    aBuilder.Add(aRes, myBody.Shape());
    aBuilder.Add(aRes, myThreading);

    return aRes;
}