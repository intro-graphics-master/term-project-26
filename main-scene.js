import {tiny, defs} from './common.js';
const { Vec, Mat, Mat4, Color, Shape, Shader, 
         Scene, Canvas_Widget, Code_Widget, Text_Widget } = tiny;           // Pull these names into this module's scope for convenience.

    // Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and common.js.
    // This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

    // ******************** Extra step only for when executing on a local machine:  
    //                      Load any more files in your directory and copy them into "defs."
    //                      (On the web, a server should instead just pack all these as well 
    //                      as common.js into one file for you, such as "dependencies.js")

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;
import { Axes_Viewer, Axes_Viewer_Test_Scene } 
  from "./axes-viewer.js"
import { Inertia_Demo, Collision_Demo }
  from "./collisions-demo.js"
import { Many_Lights_Demo }
  from "./many-lights-demo.js"
import { Nesting_Test }
  from './nesting-test.js'
import { Obj_File_Demo }
  from "./obj-file-demo.js"
import { Scene_To_Texture_Demo }
  from "./scene-to-texture-demo.js"
import { Text_Demo }
  from "./text-demo.js"  ;
import { Transforms_Sandbox } 
  from "./transforms-sandbox.js"

Object.assign( defs,
                     { Axes_Viewer, Axes_Viewer_Test_Scene },
                     { Inertia_Demo, Collision_Demo },
                     { Many_Lights_Demo },
                     { Nesting_Test },
                     { Obj_File_Demo },
                     { Scene_To_Texture_Demo },
                     { Text_Demo },
                     { Transforms_Sandbox } );


    // ******************** End extra step

// (Can define Main_Scene's class here)

const Main_Scene = Text_Demo;
const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs }