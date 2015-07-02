

var canvas;
var gl;

var numVertices  = 36;

var texSize = 64;

var program;

//Array of points to draw
var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

//Two different textures
var texture;
var textureTwo;

//UV coordinates for texture mapping to fill entire face
var texCoord = [
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1),
    vec2(0, 0)
];

//Used to make the image zoom out by 50%
var zoom = [
    vec2(1.25, -.25),
    vec2(1.25, 1.25),
    vec2(-.25, 1.25),
    vec2(-.25, -.25)
];

//Vertices to make the cube
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

//Will only use black since we have a texture.
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];    

//Variables from Edward Angel Code - might not be used anymore
var xAxis = 0;
var yAxis = 0;
var zAxis = 1;
var axis = xAxis;

var thetaLoc;

///Variables to Set up View
var modelViewMatrix;
var projectionMatrix;
var cameraViewMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, cameraViewMatrixLoc;
var eye = 7;
var at = vec3(0, 0, 0);
var up = vec3(0.0, 3.0, 0.0);
var fov = 75;
var aspect = 96/54;
var near = 0.1;
var far = 30;

//For scrolling texture of Cube #4
var time =0;
var scroll = 0;
var scrollVec; 
var scrollLoc, scrollVecLoc;

//Bool for if we should rotate the Cube
var isRotating = false;

//Spin the texture of Cube #3
var spin = 0;
var spinMatrix;
var spinLoc, spinMatrixLoc;


//used to initialize first texture, but do not bind yet.
function configureTexture( image) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    //Set filtering to Trilinear filtering
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    //Since the image is zoomed out, repeat in extra space.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);     

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    //Set binding to null until render
    gl.bindTexture( gl.TEXTURE_2D, null);
}



//Pushes black into colors array.
//Either zoom or texCoord into texture array
//Pushes vertices into points array.
function quad(a, b, c, d, triLinear) {
    if(triLinear){
        var coord = zoom;
    }
    else{
        var coord = texCoord;
    }
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[0]); 
     texCoordsArray.push(coord[2]);

     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[0]);
     texCoordsArray.push(coord[3]); 

     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[0]);
     texCoordsArray.push(coord[0]); 
   
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[0]);
     texCoordsArray.push(coord[2]); 

     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[0]);
     texCoordsArray.push(coord[0]); 

     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[0]);
     texCoordsArray.push(coord[1]);   
}

//Function to draw vertices, colors and textCoords for cube.
function colorCube(triLinear)
{
    quad( 1, 0, 3, 2 ,triLinear);
    quad( 2, 3, 7, 6 , triLinear);
    quad( 3, 0, 4, 7 , triLinear);
    quad( 6, 5, 1, 2 , triLinear);
    quad( 4, 5, 6, 7 , triLinear);
    quad( 5, 4, 0, 1 , triLinear);
}




window.onload = function init() {

//Set up canvas
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
//Push array of points to draw cube
    colorCube(false);
    colorCube(true);
    

//Initalize color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

//Initialize points buffer.
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    

//Initialize texture buffer. 
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

//Set up persepective and view of image. 
    cameraViewMatrixLoc = gl.getUniformLocation(program, "cameraViewMatrix");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix");
  
 //Set up variables to pass into fragment shader to edit fTexCoord 
    spinMatrixLoc = gl.getUniformLocation(program, "spinMatrix");
    spinLoc =    gl.getUniformLocation(program, "spinOn");
    scrollVecLoc = gl.getUniformLocation(program, "scrollVec");
    scrollLoc = gl.getUniformLocation(program, "scroll");
  
   // Initialize a textures

    var image = new Image();
    image.onload = function() { 
       configureTexture( image);
    }
    image.src = "radiator.jpg"
    
    //Initialize texture two. 
    var imageTwo = new Image();
    imageTwo.onload = function(){
    textureTwo = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, textureTwo );

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, imageTwo);
    gl.generateMipmap( gl.TEXTURE_2D );
    //Set filering to Nearest neighbor
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.bindTexture(gl.TEXTURE_2D, null);
}  
    imageTwo.src = "pocahontas.jpeg";
   
   //Pass time as a parameter of render so the time variable will store the time each frame renders
   //since the start of the program.
    render(time);
 
}

var render = function(time){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//Get position of camera and projection view.
    if(eye < 0)
        eye =0;
    cameraViewMatrix = lookAt(vec3(0, 0, eye), at, up); 
    projectionMatrix = perspective(fov, aspect, near, far);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
//Indicate whether to spin or rotate the texture of respective cubes. 
    gl.uniform1i(spinLoc, spin);
    gl.uniform1i( scrollLoc, scroll);


//Draw cube # 3
    //Set spinMatrix to rotate at 15rpm about z-axis since the texture is on the xy plane
    spinMatrix = mat4();
    spinMatrix = mult(spinMatrix, translate(vec3( .5, .5, 0)));
    spinMatrix= mult(spinMatrix, rotate( time*(9/100), [ 0, 0, 1]));
    spinMatrix = mult(spinMatrix, translate (vec3( -.5, -.5, 0)));
    gl.uniformMatrix4fv(spinMatrixLoc, false, flatten(spinMatrix));

    //Cube 3 will not scroll so set the scrollVec to (0,0).
    gl.uniform2f(scrollVecLoc, 0, 0);
    var cube2 = mat4(); 
    cube2 = mult(cube2, cameraViewMatrix);
    cube2 = mult(cube2, translate(vec3(-4,0,0)));
    cube2 = mult(cube2, scale(3,3,3));

    //Rotate cube about y axix if user presses r
    if(isRotating)
            cube2 = mult(cube2, rotate(time* (6/100), [0, 1, 0]));
    gl.uniformMatrix4fv (modelViewMatrixLoc, false, flatten(cube2));
    //Use pocahontas texture for cube 2
    gl.bindTexture( gl.TEXTURE_2D, textureTwo);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

//Draw cube # 4
    //Set the spinMatrix to the identity matrix since we do not want to spin the texture of Cube 4
    spinMatrix = mat4();
    gl.uniformMatrix4fv(spinMatrixLoc, false, flatten(spinMatrix));

    //Set scrollVec to a cosine function of time to continuously scroll left and right.
    gl.uniform2f(scrollVecLoc, 5* Math.cos(.0005 * time), 0);

    //Set cube in model view
    var cube = mat4();
    cube = mult(cube, cameraViewMatrix);
    cube = mult(cube, translate(vec3(4,0,0)));
    cube = mult(cube, scale(3,3,3));

    //Cube 4 should rotates about x axis if user presses R
    if(isRotating)
            cube = mult(cube, rotate(time*(3/100), [ 1, 0, 0]));
    
    //Use radiator texture for cube 1
    gl.bindTexture( gl.TEXTURE_2D, texture);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(cube));
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices);


    requestAnimFrame(render);
}


function keyPressed(k){
    k = k || window.event;
    if(k.keyCode == 73 || k.charCode == 73){
        //if press i
        eye -= 1; 
     }
    if(k.keyCode == 79 || k.charCode == 79){
        //if press o
        eye += 1;
    }
    if(k.keyCode == 83 || k.charCode == 83){
        //If press s
        if( scroll == 1)
            scroll = 0;
        else
            scroll =1;
    }
   if(k.keyCode == 82 || k.charCode == 82){
    //If press r
        if( isRotating == true)
            isRotating = false;
        else
            isRotating =true;
    }
    if(k.keyCode == 84 || k.charCode == 84){
        //if press t
        if( spin == 1)
            spin = 0;
        else
            spin =1;
    }

}
