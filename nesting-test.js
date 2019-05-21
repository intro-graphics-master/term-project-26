import {tiny, defs} from './common.js';
                                                  // Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;
import { Axes_Viewer, Axes_Viewer_Test_Scene } 
  from "./axes-viewer.js"
import { Inertia_Demo, Collision_Demo }
  from "./collisions-demo.js"
import { Many_Lights_Demo }
  from "./many-lights-demo.js"
import { Obj_File_Demo }
  from "./obj-file-demo.js"
import { Scene_To_Texture_Demo }
  from "./scene-to-texture-demo.js"
import { Text_Demo }
  from "./text-demo.js"  
import { Transforms_Sandbox }
  from './transforms-sandbox.js';


class Surfaces_Demo extends Scene
{ constructor( scene_id )
    { super();
      this.scene_id = scene_id;

      [ this.scene_1 ][ scene_id ] ();
    }
  scene_1()
    { const row_operation = p => Mat4.translation([ 0,-1,0 ]).times(p.to4(1)).to3();
      const column_operation = (j,p) => Mat4.translation([ 1,0,0 ]).times(p.to4(1)).to3();
      this.shapes = { sheet: new defs.Grid_Patch( 10, 10, row_operation, column_operation ) };

      const textured = new defs.Textured_Phong( 1 );
      this.material = new Material( textured, { ambient: .5, texture: new Texture( "assets/rgb.jpg" ) } );
    }
  display( context, program_state )
    { if( !context.scratchpad.controls ) 
        { this.children.push( context.scratchpad.controls = new defs.Movement_Controls() );
          program_state.set_camera( Mat4.translation([ 0,0,-10 ]) );
          program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 );
        }
      this.shapes.sheet.draw( context, program_state, Mat4.identity(), this.material );
    }
}
  
export class Nesting_Test extends Transforms_Sandbox
  { constructor()
      { super();
        
        this.test_scene = new Surfaces_Demo( 0 );
      }
    show_explanation( document_element, webgl_manager )
      { document_element.style.padding = 0;
        document_element.style.width = "1080px";
        document_element.style.overflowY = "hidden";

        const cw = new tiny.Canvas_Widget( document_element, undefined, [] );
        cw.webgl_manager.scenes.push( this.test_scene );
        cw.webgl_manager.program_state = webgl_manager.program_state;

        document_element.appendChild( document.createTextNode("adfafaf") );
      }
  }