import { tiny, defs } from './assignment-4-resources.js';
// Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Light, Shape, Shader, Material, Texture,
  Scene, Canvas_Widget, Code_Widget, Text_Widget } = tiny;
const { Cube, Subdivision_Sphere, Transforms_Sandbox_Base } = defs;

var snap_on = false;
var audio_flag = false;
var fade_flag = false;
const audio_delay = 2;
const fade_delay = audio_delay + 6;
const complete_fade = 6; //TODO: Tune this
var t_snap_time = -1;
var t_mr_stark = undefined;
// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and assignment-4-resources.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

function play_snap(name) {
    if (name === "snap") {
      var audio = new Audio('./assets/snap.mp3');
      snap_on = true;
    }
    else
      var audio = new Audio('./assets/mr_stark.mp3');
    audio.play();
}

function slope_decider() { //Function used to decide slope for moving blocks
    var max = 1; //TODO: Tune this
    var min = 0; //TODO: Tune this
    return (Math.floor(Math.random() * (max - min)) + min); 
}

function offset(x_pos) {
    var x_max = 8;
    var fade_speed = 6; //TODO: Tune this
    return ((x_max - x_pos)/fade_speed);
}

function noey(a, b) {
    if (a < b) return 0;
    else return (a - b);
}
function scale_ratio(x_pos, t) {
    if (typeof t_mr_stark === 'undefined') return 1;
    let off = offset(x_pos);
    let full = (15 + off);
    return ((full - noey(t, t_mr_stark + complete_fade + off))/(full));
}

//colors
const red = Color.of(1, 0, 0, 1);
const blue = Color.of(0, 0, 1, 1);
const black = Color.of(0, 0, 0, 1);
const white = Color.of(1, 1, 1, 1);
const brown = Color.of(0.5313, 0.3438, 0.1953, 1);
const red_rgb = [1, 0, 0];
const blue_rgb = [0, 0, 1];
const black_rgb = [0, 0, 0];
const white_rgb = [1, 1, 1];
const brown_rgb = [0.5313, 0.3438, 0.1953];

const Box = defs.Box =
class Box {
  constructor(fill, color, transform, slope) {
      this.fill = fill;
      this.color = color;
      this.transform = transform;
      this.slope = slope;
  }
}

let spiderman_transform = Mat4.identity();
let body_transform = spiderman_transform.times(Mat4.translation([-3.5, 6.5, -4]));
body_transform = body_transform.times(Mat4.scale([0.25, 0.25, 0.25]));

var image = [ //0 - no fill, 1 - white, 2 - black, 3 - red, 4 - blue
    [
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,2,2,3,3,3,3,2,2,0,0,0,0],
        [0,0,0,0,1,1,2,3,3,2,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,3,3,1,1,1,0,0,0,0],
        [0,0,0,0,2,1,1,3,3,1,1,2,0,0,0,0],
        [0,0,0,0,3,2,2,3,3,2,2,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0],
        [0,0,0,3,4,3,3,3,3,3,3,4,3,0,0,0],
        [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
        [0,0,3,3,3,3,2,3,3,2,3,3,3,3,0,0],
        [0,3,3,4,4,3,3,2,2,3,3,4,4,3,3,0],
        [0,3,4,0,4,3,2,2,2,2,3,4,0,4,3,0],
        [0,3,4,0,4,4,3,2,2,3,4,4,0,4,3,0],
        [0,3,4,0,3,3,3,3,3,3,3,3,0,3,3,0],
        [0,3,3,0,4,3,3,3,3,3,3,4,0,3,3,0],
        [0,3,3,0,4,4,4,3,3,4,4,4,0,3,3,0],
        [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,2,3,3,3,3,3,3,2,0,0,0,0],
        [0,0,0,0,2,3,3,3,3,3,3,2,0,0,0,0],
        [0,0,0,0,2,3,3,3,3,3,3,2,0,0,0,0],
        [0,0,0,0,2,3,3,3,3,3,3,2,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0],
        [0,0,0,3,4,3,3,3,3,3,3,4,3,0,0,0],
        [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
        [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
        [0,3,3,4,4,3,3,3,3,3,3,4,4,3,3,0],
        [0,3,4,0,4,3,3,3,3,3,3,4,0,4,3,0],
        [0,3,4,0,4,3,3,3,3,3,3,4,0,4,3,0],
        [0,3,4,0,3,3,3,3,3,3,3,3,0,3,3,0],
        [0,3,3,0,4,3,3,3,3,3,3,4,0,3,3,0],
        [0,3,3,0,4,3,3,3,3,3,3,4,0,3,3,0],
        [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0],
        [0,0,0,3,4,3,3,3,3,3,3,4,3,0,0,0],
        [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
        [0,0,3,3,3,3,2,3,3,2,3,3,3,3,0,0],
        [0,3,3,4,4,3,3,2,2,3,3,4,4,3,3,0],
        [0,3,4,0,4,3,2,2,2,2,3,4,0,4,3,0],
        [0,3,4,0,4,4,3,2,2,3,4,4,0,4,3,0],
        [0,3,4,0,3,3,3,3,3,3,3,3,0,3,3,0],
        [0,3,3,0,4,3,3,3,3,3,3,4,0,3,3,0],
        [0,3,3,0,4,4,4,3,3,4,4,4,0,3,3,0],
        [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0]
    ]
];

var width = 16, height = 27, depth = 3;
var box_array = new Array();
for(let x = 0; x < width; x++) {
    box_array[x] = new Array();
    for(let y = 0; y < height; y++) {
        box_array[x][y] = new Array();
        for(let z = 0; z < depth; z++) {
            let translated_transform = body_transform.times(Mat4.translation([2*x, 2*-y, 2*-z]));
            let angle = Math.random()*5;
            switch(image[z][y][x]) {
                case 1:
                    box_array[x][y][z] = new Box(true, white, translated_transform, angle);
                    break;
                case 2:
                    box_array[x][y][z] = new Box(true, black, translated_transform, angle);
                    break;
                case 3:
                    box_array[x][y][z] = new Box(true, red, translated_transform, angle);
                    break;
                case 4:
                    box_array[x][y][z] = new Box(true, blue, translated_transform, angle);
                    break;
                default:
                    box_array[x][y][z] = new Box(false, Color.of(0, 0, 0, 0), translated_transform, angle);
            }
            
        }
    }
}


// (Can define Main_Scene's class here)

const Main_Scene =
class I_am_Inevitable extends Scene {
    constructor() { // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape 
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape.
        // Don't define blueprints for shapes in display() every frame.

        this.shapes = {
            'box': new Cube(),
            'ball_4': new Subdivision_Sphere(4),
            'star': new Planar_Star()
        };

        // *** Shaders ***

        // NOTE: The 2 in each shader argument refers to the max
        // number of lights, which must be known at compile time.

        // A simple Phong_Blinn shader without textures:
        const phong_shader = new defs.Phong_Shader(2);
        // Adding textures to the previous shader:
        const texture_shader = new defs.Textured_Phong(2);
        // Same thing, but with a trick to make the textures 
        // seemingly interact with the lights:
        const texture_shader_2 = new defs.Fake_Bump_Map(2);
        const sky_box = new defs.Sky_Box(2);
        
        // *** Materials: *** wrap a dictionary of "options" for a shader.

        this.materials = {
            plastic: new Material(phong_shader,
            { ambient: 1, diffusivity: 0, specularity: 0, color: Color.of(1, .5, 1, 1) }),
            metal: new Material(phong_shader,
            { ambient: 0, diffusivity: 1, specularity: 1, color: Color.of(1, .5, 1, 1) }),
            down: new Material(sky_box, 
            {
                texture: new Texture("assets/down.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            }),

            right: new Material(sky_box, 
            {
                texture: new Texture("assets/right.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            }),
            back: new Material(sky_box, 
            {
                texture: new Texture("assets/back.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            }),
            left: new Material(sky_box, 
            {
                texture: new Texture("assets/left.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            }),   
            front: new Material(sky_box, 
            {
                texture: new Texture("assets/front.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            }),   
            up: new Material(sky_box, 
            {
                texture: new Texture("assets/up.jpg"),
                ambient: 1, diffusivity: 1, specularity: 1, color: Color.of(0,0,0,1 )
            })
        };

      // Some setup code that tracks whether the "lights are on" (the stars), and also
      // stores 30 random location matrices for drawing stars behind the solar system:
    }
    make_control_panel() {  // make_control_panel(): Sets up a panel of interactive HTML elements, including
      // buttons with key bindings for affecting this scene, and live info readouts.
      this.key_triggered_button("Snap", ["`"], () => play_snap("snap"));
    }
    display(context, program_state) {                                                // display():  Called once per frame of animation.  For each shape that you want to
        // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
        // different matrix value to control where the shape appears.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {                       // Add a movement controls panel to the page:
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            // Add a helper scene / child scene that allows viewing each moving body up close.
            this.children.push(this.camera_teleporter = new Camera_Teleporter());

            // Define the global camera and projection matrices, which are stored in program_state.  The camera
            // matrix follows the usual format for transforms, but with opposite values (cameras exist as 
            // inverted matrices).  The projection matrix follows an unusual format and determines how depth is 
            // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() and
            // orthographic() automatically generate valid matrices for one.  The input arguments of
            // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.          
            program_state.set_camera(Mat4.look_at(Vec.of(0, 0, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0)));
            this.initial_camera_location = program_state.camera_inverse;
            program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 200);
        }

        // Find how much time has passed in seconds; we can use
        // time as an input when calculating new transforms:
        const t = program_state.animation_time / 1000;
        if (t_snap_time === -1 && snap_on) {
            t_snap_time = t + fade_delay;
            t_mr_stark = t + audio_delay;
        }
  
        if (typeof t_mr_stark !== 'undefined' && t > t_mr_stark && !audio_flag) {
          play_snap("stark");
          audio_flag = true;
          fade_flag = true;
        }
        
        // Have to reset this for each frame:
        this.camera_teleporter.cameras = [];
        this.camera_teleporter.cameras.push(Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0)));


        // Variables that are in scope for you to use:
        // this.shapes: Your shapes, defined above.
        // this.materials: Your materials, defined above.
        // this.lights:  Assign an array of Light objects to this to light up your scene.
        // this.lights_on:  A boolean variable that changes when the user presses a button.
        // this.camera_teleporter: A child scene that helps you see your planets up close.
        //                         For this to work, you must push their inverted matrices
        //                         into the "this.camera_teleporter.cameras" array.
        // t:  Your program's time in seconds.
        // program_state:  Information the shader needs for drawing.  Pass to draw().
        // context:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().                                                       


        /**********************************
         Start coding down here!!!!
        **********************************/

        // Variable model_transform will be a local matrix value that helps us position shapes.
        // It starts over as the identity every single frame - coordinate axes at the origin.
        let model_transform = Mat4.identity();       

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by 
        // the shader when coloring shapes.  See Light's class definition for inputs.
        program_state.lights = [ new Light( Vec.of( 0,0,0,1 ), Color.of( 1,1,1,1 ), 100000 ) ];
        

        /// *********  BACKGROUND SCENE *********
        //Create a scene
        let sky_transform = Mat4.identity();
        let sky_stack = [sky_transform];
        sky_stack.push(sky_transform); 
        
        //floor
        sky_transform = sky_transform.times(Mat4.translation([0, -50, 0]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(50,0.2,50)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.down); 

        //ceiling
        sky_transform = sky_stack.pop();
        sky_stack.push(sky_transform);
        sky_transform = sky_transform.times(Mat4.translation([0, 50, 0]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(50,0.2,50)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.up ); 

        //right wall 
        sky_transform = sky_stack.pop();
        sky_stack.push(sky_transform);
        sky_transform = sky_transform.times(Mat4.translation([50, 0, 0]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(0.2,50,50)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.right );

        //left wall 
        sky_transform = sky_stack.pop();
        sky_stack.push(sky_transform);
        sky_transform = sky_transform.times(Mat4.translation([-50, 0, 0]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(0.2,50,50)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.left );

        //back wall 
        sky_transform = sky_stack.pop();
        sky_stack.push(sky_transform);
        sky_transform = sky_transform.times(Mat4.translation([0, 0, -50]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(50,50,0.2)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.back);

        //front wall 
        sky_transform = sky_stack.pop();
        sky_stack.push(sky_transform);
        sky_transform = sky_transform.times(Mat4.translation([0, 0, 50]));
        sky_transform = sky_transform.times(Mat4.scale(Vec.of(50,50,0.2)));
        this.shapes.box.draw(context, program_state, sky_transform, this.materials.front );

        /// ********* END BACKGROUND SCENE *********

        for(let x = 0; x < width; x++) {
            for(let y = 0; y < height; y++) {
                for(let z = 0; z < depth; z++) {
                    if(box_array[x][y][z].fill) {
                        
                        let scale = scale_ratio(x, t);
                        let translate_speed = 0.4
                        if(scale < 1) {
                            box_array[x][y][z].transform = box_array[x][y][z].transform.times(Mat4.rotation(box_array[x][y][z].slope, [0, 1, 0]));
                            //box_array[x][y][z].transform = box_array[x][y][z].transform.times(Mat4.rotation(box_array[x][y][z].slope[1], [0, 0, 1]));
                            box_array[x][y][z].transform = box_array[x][y][z].transform.times(Mat4.translation([translate_speed, 0, 0]));
                            box_array[x][y][z].transform = box_array[x][y][z].transform.times(Mat4.rotation(-box_array[x][y][z].slope, [0, 1, 0]));
                        }
                        box_array[x][y][z].transform = box_array[x][y][z].transform.times(Mat4.scale(Vec.of( scale, scale, scale )));
                        if (scale > 0.01) {
                            /*
                            if (box_array[x][y][z].color === red) {
                                const r = (1 - scale) * brown_rgb[0] + scale * red_rgb[0];
                                const g = (1 - scale) * brown_rgb[1] + scale * red_rgb[1];
                                const b = (1 - scale) * brown_rgb[2] + scale * red_rgb[2];
                                fade_color = Color.of(r, g, b, 1);
                            }
                            else if (box_array[x][y][z].color === blue) {
                                const r = (1 - scale) * brown_rgb[0] + scale * blue_rgb[0];
                                const g = (1 - scale) * brown_rgb[1] + scale * blue_rgb[1];
                                const b = (1 - scale) * brown_rgb[2] + scale * blue_rgb[2];
                                fade_color = Color.of(r, g, b, 1);
                            }
                            else if (box_array[x][y][z].color === black) {
                                const r = (1 - scale) * brown_rgb[0] + scale * black_rgb[0];
                                const g = (1 - scale) * brown_rgb[1] + scale * black_rgb[1];
                                const b = (1 - scale) * brown_rgb[2] + scale * black_rgb[2];
                                fade_color = Color.of(r, g, b, 1);
                            }
                            else {
                                const r = (1 - scale) * brown_rgb[0] + scale * white_rgb[0];
                                const g = (1 - scale) * brown_rgb[1] + scale * white_rgb[1];
                                const b = (1 - scale) *brown_rgb[2] + scale * white_rgb[2];
                                fade_color = Color.of(r, g, b, 1);
                            }
                            */
                            
                           let fade_color = undefined;
                            if (scale > 0.95)
                                fade_color = box_array[x][y][z].color;
                            else
                                fade_color = brown;

                            this.shapes.box.draw(context, program_state, box_array[x][y][z].transform,
                            this.materials.plastic.override( fade_color ));
                        }
                    }
                }
            }
        }

    }
   
}

const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs }


const Camera_Teleporter = defs.Camera_Teleporter =
  class Camera_Teleporter extends Scene {                               // **Camera_Teleporter** is a helper Scene meant to be added as a child to
    // your own Scene.  It adds a panel of buttons.  Any matrices externally
    // added to its "this.cameras" can be selected with these buttons. Upon
    // selection, the program_state's camera matrix slowly (smoothly)
    // linearly interpolates itself until it matches the selected matrix.
    constructor() {
      super();
      this.cameras = [];
      this.selection = 0;
    }
    make_control_panel() {  // make_control_panel(): Sets up a panel of interactive HTML elements, including
      // buttons with key bindings for affecting this scene, and live info readouts.

      this.key_triggered_button("Enable", ["e"], () => this.enabled = true);
      this.key_triggered_button("Disable", ["Shift", "E"], () => this.enabled = false);
      this.new_line();
      this.key_triggered_button("Previous location", ["g"], this.decrease);
      this.key_triggered_button("Next", ["h"], this.increase);
      this.new_line();
      this.live_string(box => { box.textContent = "Selected camera location: " + this.selection });
    }
    increase() { this.selection = Math.min(this.selection + 1, Math.max(this.cameras.length - 1, 0)); }
    decrease() { this.selection = Math.max(this.selection - 1, 0); }   // Don't allow selection of negative indices.
    display(context, program_state) {
      const desired_camera = this.cameras[this.selection];
      if (!desired_camera || !this.enabled)
        return;
      const dt = program_state.animation_delta_time;
      program_state.set_camera(desired_camera.map((x, i) => Vec.from(program_state.camera_inverse[i]).mix(x, .01 * dt)));
    }
  }


const Planar_Star = defs.Planar_Star =
  class Planar_Star extends Shape {                                 // **Planar_Star** defines a 2D five-pointed star shape.  The star's inner 
    // radius is 4, and its outer radius is 7.  This means the complete star 
    // fits inside a 14 by 14 sqaure, and is centered at the origin.
    constructor() {
      super("position", "normal", "texture_coord");

      this.arrays.position.push(Vec.of(0, 0, 0));
      for (let i = 0; i < 11; i++) {
        const spin = Mat4.rotation(i * 2 * Math.PI / 10, Vec.of(0, 0, -1));

        const radius = i % 2 ? 4 : 7;
        const new_point = spin.times(Vec.of(0, radius, 0, 1)).to3();

        this.arrays.position.push(new_point);
        if (i > 0)
          this.indices.push(0, i, i + 1)
      }

      this.arrays.normal = this.arrays.position.map(p => Vec.of(0, 0, -1));
    }
  }
