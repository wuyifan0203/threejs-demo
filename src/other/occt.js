import {
    Mesh,
    MeshNormalMaterial,
    BufferGeometry,
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
window.onload = async () => {
    try {
        occ = await initOpenCascade();
        OpenCascadeHelper.setOpenCascade(occ);
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

    function update(){
        const bottle = makeBottle(params.width, params.thickness, params.height);
        const geometry = OpenCascadeHelper.convertBufferGeometry(bottle);
        mesh.geometry.dispose();
        mesh.geometry = geometry;
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
    gui.add(mesh.material,'wireframe')
}

function makeBottle(width, thickness, height) {
    const [hw, qt] = [width / 2, thickness / 4];
    // Profile : Define Support Points
    const aPnt1 = new occ.gp_Pnt_3(-hw, 0, 0);
    const aPnt2 = new occ.gp_Pnt_3(-hw, -qt, 0);
    const aPnt3 = new occ.gp_Pnt_3(0, -thickness / 2., 0);
    const aPnt4 = new occ.gp_Pnt_3(hw, -qt, 0);
    const aPnt5 = new occ.gp_Pnt_3(hw, 0, 0);

    // Profile : Define the Geometry
    const anArcOfCircle = new occ.GC_MakeArcOfCircle_4(aPnt2, aPnt3, aPnt4);
    const aSegment1 = new occ.GC_MakeSegment_1(aPnt1, aPnt2);
    const aSegment2 = new occ.GC_MakeSegment_1(aPnt4, aPnt5);

    // Profile : Define the Topology
    const anEdge1 = new occ.BRepBuilderAPI_MakeEdge_24(new occ.Handle_Geom_Curve_2(aSegment1.Value().get()));
    const anEdge2 = new occ.BRepBuilderAPI_MakeEdge_24(new occ.Handle_Geom_Curve_2(anArcOfCircle.Value().get()));
    const anEdge3 = new occ.BRepBuilderAPI_MakeEdge_24(new occ.Handle_Geom_Curve_2(aSegment2.Value().get()));
    const aWire = new occ.BRepBuilderAPI_MakeWire_4(anEdge1.Edge(), anEdge2.Edge(), anEdge3.Edge());

    // Complete Profile
    const xAxis = occ.gp.OX();
    const aTrsf = new occ.gp_Trsf_1();

    aTrsf.SetMirror_2(xAxis);
    const aBRepTrsf = new occ.BRepBuilderAPI_Transform_2(aWire.Wire(), aTrsf, false);
    const aMirroredShape = aBRepTrsf.Shape();

    const mkWire = new occ.BRepBuilderAPI_MakeWire_1();
    mkWire.Add_2(aWire.Wire());
    mkWire.Add_2(occ.TopoDS.Wire_1(aMirroredShape));
    const myWireProfile = mkWire.Wire();

    // Body : Prism the Profile
    const myFaceProfile = new occ.BRepBuilderAPI_MakeFace_15(myWireProfile, false);
    const aPrismVec = new occ.gp_Vec_4(0, 0, height);
    let myBody = new occ.BRepPrimAPI_MakePrism_1(myFaceProfile.Face(), aPrismVec, false, true);

    // Body : Apply Fillets
    const mkFillet = new occ.BRepFilletAPI_MakeFillet(myBody.Shape(), occ.ChFi3d_FilletShape.ChFi3d_Rational);
    const anEdgeExplorer = new occ.TopExp_Explorer_2(myBody.Shape(), occ.TopAbs_ShapeEnum.TopAbs_EDGE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while (anEdgeExplorer.More()) {
        const anEdge = occ.TopoDS.Edge_1(anEdgeExplorer.Current());
        // Add edge to fillet algorithm
        mkFillet.Add_2(thickness / 12., anEdge);
        anEdgeExplorer.Next();
    }
    myBody = mkFillet.Shape();

    // Body : Add the Neck
    const neckLocation = new occ.gp_Pnt_3(0, 0, height);
    const neckAxis = occ.gp.DZ();
    const neckAx2 = new occ.gp_Ax2_3(neckLocation, neckAxis);

    const myNeckRadius = qt;
    const myNeckHeight = height / 10.;

    const MKCylinder = new occ.BRepPrimAPI_MakeCylinder_3(neckAx2, myNeckRadius, myNeckHeight);
    const myNeck = MKCylinder.Shape();

    myBody = new occ.BRepAlgoAPI_Fuse_3(myBody, myNeck, new occ.Message_ProgressRange_1());

    // Body : Create a Hollowed Solid
    let faceToRemove;
    let zMax = -1;
    const aFaceExplorer = new occ.TopExp_Explorer_2(myBody.Shape(), occ.TopAbs_ShapeEnum.TopAbs_FACE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
    for (; aFaceExplorer.More(); aFaceExplorer.Next()) {
        const aFace = occ.TopoDS.Face_1(aFaceExplorer.Current());
        // Check if <aFace> is the top face of the bottle's neck 
        const aSurface = occ.BRep_Tool.Surface_2(aFace);
        if (aSurface.get().$$.ptrType.name === "Geom_Plane*") {
            const aPlane = new occ.Handle_Geom_Plane_2(aSurface.get()).get();
            const aPnt = aPlane.Location();
            const aZ = aPnt.Z();
            if (aZ > zMax) {
                zMax = aZ;
                faceToRemove = new occ.TopExp_Explorer_2(aFace, occ.TopAbs_ShapeEnum.TopAbs_FACE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE).Current();
            }
        }
    }

    const facesToRemove = new occ.TopTools_ListOfShape_1();
    facesToRemove.Append_1(faceToRemove);
    const s = myBody.Shape();
    myBody = new occ.BRepOffsetAPI_MakeThickSolid();
    myBody.MakeThickSolidByJoin(s, facesToRemove, -thickness / 50, 1.e-3, occ.BRepOffset_Mode.BRepOffset_Skin, false, false, occ.GeomAbs_JoinType.GeomAbs_Arc, false, new occ.Message_ProgressRange_1());
    // Threading : Create Surfaces
    const aCyl1 = new occ.Geom_CylindricalSurface_1(new occ.gp_Ax3_2(neckAx2), myNeckRadius * 0.99);
    const aCyl2 = new occ.Geom_CylindricalSurface_1(new occ.gp_Ax3_2(neckAx2), myNeckRadius * 1.05);

    // Threading : Define 2D Curves
    const aPnt = new occ.gp_Pnt2d_3(2. * Math.PI, myNeckHeight / 2.);
    const aDir = new occ.gp_Dir2d_4(2. * Math.PI, myNeckHeight / 4.);
    const anAx2d = new occ.gp_Ax2d_2(aPnt, aDir);

    const aMajor = 2. * Math.PI;
    const aMinor = myNeckHeight / 10;

    const anEllipse1 = new occ.Geom2d_Ellipse_2(anAx2d, aMajor, aMinor, true);
    const anEllipse2 = new occ.Geom2d_Ellipse_2(anAx2d, aMajor, aMinor / 4, true);
    const anArc1 = new occ.Geom2d_TrimmedCurve(new occ.Handle_Geom2d_Curve_2(anEllipse1), 0, Math.PI, true, true);
    const anArc2 = new occ.Geom2d_TrimmedCurve(new occ.Handle_Geom2d_Curve_2(anEllipse2), 0, Math.PI, true, true);
    const tmp1 = anEllipse1.Value(0);
    const anEllipsePnt1 = new occ.gp_Pnt2d_3(tmp1.X(), tmp1.Y());
    const tmp2 = anEllipse1.Value(Math.PI);
    const anEllipsePnt2 = new occ.gp_Pnt2d_3(tmp2.X(), tmp2.Y());

    const aSegment = new occ.GCE2d_MakeSegment_1(anEllipsePnt1, anEllipsePnt2);
    // Threading : Build Edges and Wires
    const anEdge1OnSurf1 = new occ.BRepBuilderAPI_MakeEdge_30(new occ.Handle_Geom2d_Curve_2(anArc1), new occ.Handle_Geom_Surface_2(aCyl1));
    const anEdge2OnSurf1 = new occ.BRepBuilderAPI_MakeEdge_30(new occ.Handle_Geom2d_Curve_2(aSegment.Value().get()), new occ.Handle_Geom_Surface_2(aCyl1));
    const anEdge1OnSurf2 = new occ.BRepBuilderAPI_MakeEdge_30(new occ.Handle_Geom2d_Curve_2(anArc2), new occ.Handle_Geom_Surface_2(aCyl2));
    const anEdge2OnSurf2 = new occ.BRepBuilderAPI_MakeEdge_30(new occ.Handle_Geom2d_Curve_2(aSegment.Value().get()), new occ.Handle_Geom_Surface_2(aCyl2));
    const threadingWire1 = new occ.BRepBuilderAPI_MakeWire_3(anEdge1OnSurf1.Edge(), anEdge2OnSurf1.Edge());
    const threadingWire2 = new occ.BRepBuilderAPI_MakeWire_3(anEdge1OnSurf2.Edge(), anEdge2OnSurf2.Edge());
    occ.BRepLib.BuildCurves3d_2(threadingWire1.Wire());
    occ.BRepLib.BuildCurves3d_2(threadingWire2.Wire());
    occ.BRepLib.BuildCurves3d_2(threadingWire1.Wire());
    occ.BRepLib.BuildCurves3d_2(threadingWire2.Wire());

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