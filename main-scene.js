import { tiny, defs } from './assignment-4-resources.js';
// Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Light, Shape, Shader, Material, Texture,
  Scene, Canvas_Widget, Code_Widget, Text_Widget } = tiny;
const { Cube, Subdivision_Sphere, Transforms_Sandbox_Base } = defs;

var t_snap_time = undefined;
// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and assignment-4-resources.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

const Box = defs.Box =
class Box {
  constructor(color, transform, slope) {
      this.color = color;
      this.transform = transform;
      this.slope = slope;
  }
  
}

// body_transform = body_transform.times(Mat4.scale([0.5, 0.5, 0.5]));
// let body_stack = [body_transform];
// body_stack.push(body_transform); 
// ///FIRST LAYER 
// //first row 
// body_transform = body_transform.times(Mat4.translation([-3.5, 4.5, -0.5]));
// body_stack.push(body_transform); 
// body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
// this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

// for (let i = 0; i < 6; i++) 
// {
//     body_transform = body_stack.pop();
//     body_transform = body_transform.times(Mat4.translation([1,0,0]));
//     body_stack.push(body_transform); //prev cube center
//     body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
//     this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
// }


let spiderman_transform = Mat4.identity();
let body_transform = spiderman_transform.times(Mat4.translation([-2.5, 5, -1]));

var box_array = [[[]]]; //depth, row, column
for(let x = 0; x < 6; x++) {
    for(let y = 0; y < 10; y++) {
        for(let z = 0; z < 3; z++) {
            box_array[x, y, z] = new Box(Color.of(1, 0, 0, 1), 0.5);
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
      this.snap_on = false;
      this.star_matrices = [];
      for (let i = 0; i < 30; i++)
        this.star_matrices.push(Mat4.rotation(Math.PI / 2 * (Math.random() - .5), Vec.of(0, 1, 0))
          .times(Mat4.rotation(Math.PI / 2 * (Math.random() - .5), Vec.of(1, 0, 0)))
          .times(Mat4.translation([0, 0, -150])));
    }
    make_control_panel() {  // make_control_panel(): Sets up a panel of interactive HTML elements, including
      // buttons with key bindings for affecting this scene, and live info readouts.
      this.key_triggered_button("Snap", ["`"], () => this.snap_on = true);
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
        program_state.set_camera(Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0)));
        this.initial_camera_location = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 200);
      }

      // Find how much time has passed in seconds; we can use
      // time as an input when calculating new transforms:
      const t = program_state.animation_time / 1000;
      function slope_decider() { //Function used to decide slope for moving blocks
        var max = 1; //TODO: Tune this
        var min = 0; //TODO: Tune this
        return (Math.floor(Math.random() * (max - min)) + min); 
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

      //colors
      const red = Color.of(1, 0, 0, 1);
      const blue = Color.of(0, 0, 1, 1);
      const black = Color.of(0, 0, 0, 1);


      

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

      let spiderman_transform = Mat4.identity(); 
      
      //TODO: Build body_transform
      let body_transform = spiderman_transform.times(Mat4.translation([0,0,-10]));
      let body_stack = [body_transform];
      body_stack.push(body_transform); 
///FIRST LAYER 
      //first row 
      body_transform = body_transform.times(Mat4.translation([-3.5, 4.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      for (let i = 0; i < 6; i++) 
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      body_transform = body_stack.pop();
      body_transform = body_transform.times(Mat4.translation([1,0,0]));
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      //second row
      body_transform = body_stack.pop();
      body_stack.push(body_transform); //body center
      body_transform = body_transform.times(Mat4.translation([-3.5, 3.5, -0.5]));
      body_stack.push(body_transform); //first cube center
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));

      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //third row
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 2.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
     
      }

      //fourth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 1.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 1 || i == 4 || i == 5)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //fifth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 0.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 5 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 1 || i == 2 || i == 3 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //sixth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -0.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //seventh row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -1.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //eighth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -2.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 6 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
      }

      //ninth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -3.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //tenth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -4.5, -0.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      }

///SECOND LAYER
      body_stack.pop();
      body_transform = body_stack.pop();
      body_stack.push(body_transform);
      //first row 
      body_transform = body_transform.times(Mat4.translation([-3.5, 4.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      for (let i = 0; i < 6; i++) 
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      body_transform = body_stack.pop();
      body_transform = body_transform.times(Mat4.translation([1,0,0]));
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      //second row
      body_transform = body_stack.pop();
      body_stack.push(body_transform); //body center
      body_transform = body_transform.times(Mat4.translation([-3.5, 3.5, -1.5]));
      body_stack.push(body_transform); //first cube center
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));

      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //third row
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 2.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
     
      }

      //fourth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 1.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 1 || i == 4 || i == 5)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //fifth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 0.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 5 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 1 || i == 2 || i == 3 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //sixth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -0.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //seventh row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -1.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //eighth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -2.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 6 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
      }

      //ninth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -3.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //tenth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -4.5, -1.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      }

///THIRD LAYER
      body_stack.pop();
      body_transform = body_stack.pop();
      body_stack.push(body_transform);
      //first row 
      body_transform = body_transform.times(Mat4.translation([-3.5, 4.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      for (let i = 0; i < 6; i++) 
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      body_transform = body_stack.pop();
      body_transform = body_transform.times(Mat4.translation([1,0,0]));
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));

      //second row
      body_transform = body_stack.pop();
      body_stack.push(body_transform); //body center
      body_transform = body_transform.times(Mat4.translation([-3.5, 3.5, -2.5]));
      body_stack.push(body_transform); //first cube center
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));

      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //third row
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 2.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
     
      }

      //fourth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 1.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 1 || i == 4 || i == 5)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //fifth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, 0.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 0 || i == 5 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 1 || i == 2 || i == 3 || i == 4)
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //sixth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -0.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 1 || i == 4 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( black ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //seventh row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -1.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(red ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
      }

      //eighth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -2.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 6 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
      }

      //ninth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -3.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          if (i == 2 || i == 3 )
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( red ));
          }
          else
          {
              this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
          }
      }

      //tenth row 
      body_stack.pop(); //removing last cube center 
      body_transform = body_stack.pop();
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.translation([-3.5, -4.5, -2.5]));
      body_stack.push(body_transform); 
      body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
      this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override(blue ));
      for (let i = 0; i < 7; i++)
      {
          body_transform = body_stack.pop();
          body_transform = body_transform.times(Mat4.translation([1,0,0]));
          body_stack.push(body_transform); //prev cube center
          body_transform = body_transform.times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
          this.shapes.box.draw(context, program_state, body_transform, this.materials.plastic.override( blue ));
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
