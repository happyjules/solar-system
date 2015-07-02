var canvas;
var gl;


var time = 0.0;
var timer = new Timer();
var selfRotateAngle = 40;


var modelViewMatrix;
var viewMatrix;
var projectionMatrix;


var eye = vec3(0, 0, 50);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

var fov = 70;
var aspect = 96/54;

var xoffset = 0;
var yoffset = 0;
var zoffset = 0;
var theta = 0;
var phi = 0;

var newCam = false;

var positionBuffer;
var normalBuffer;

//Variables used to draw tetrahedron for sphere. 
var va = vec4(0.0, 0.0, -1.0, 1.0);
var vb = vec4(0.0, 0.942809, 0.333333, 1.0);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1.0);
var vd = vec4(0.816497, -0.471405, 0.333333, 1.0);

var pointsArray = [];
var  normalsArray = [];

 
//Keep track of the number of vertices used for each sphere drawn.
var index = 0;
var indexSun = 0;
var indexP1 = 0;
var indexP2 = 0;
var indexP3 = 0;
var indexP4 = 0;
var indexMoon = 0;

var bluePlanet;

var uniformViewMatrixLoc;
var modelViewMatrixLoc;
var projectionMatrixLoc;
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var lightPositionLoc;
var shininessLoc;
var phongShadingLoc;
var ATTRIBUTE_position;
var ATTRIBUTE_normal;

var positionSun = vec3(-8.0, 0.0, 0.0);
var lightPosition = positionSun;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
//Setup canvas
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
  
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

//Create Buffers for points and normals
    positionBuffer = gl.createBuffer();
    normalBuffer = gl.createBuffer();
    ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position );
    ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );
  
    //Draw all 5 spheres into pointsArray with respective normals for lighting
    drawSphere( 5,true , true);
    indexSun = index;
    drawSphere( 3, true, false);
    indexP1 = index;
    drawSphere(3, false, false);
    indexP2 = index;
    drawSphere(7, false, false);
    indexP3 = index;
    drawSphere(4, false, false);
    indexP4 = index;
    drawSphere(3, true, false);
    indexMoon = index;

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    gl.enableVertexAttribArray( ATTRIBUTE_position );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_position, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_normal, 4, gl.FLOAT, false, 0, 0 );


   uniformViewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    timer.reset();
    gl.enable(gl.DEPTH_TEST);

    render();
}


function render()
{

    //Used to characterize the size, orbit, and speed of each planet.
    var enlarge = [ 3, .4, 1.1, 1.4, .6];
    var orbit = [ 10, 5, 6, 22];
    var speed = [6, 3, 1.5, 2];

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   time += timer.getElapsedTime() / 1000;

    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fov, aspect, 0.01, 100);
        eye = vec3(2, 10, 20);
        at = vec3(0, 10, 0);
        up = vec3(0, 1, 0);
        viewMatrix = lookAt(eye, at, up);
        projectionMatrix = mult(projectionMatrix, rotate(30, [1,0,0]));
        projectionMatrix = mult(projectionMatrix, rotate(theta, [1,0,0]));
        projectionMatrix = mult(projectionMatrix, rotate(phi, [0,1,0]));
        projectionMatrix = mult(projectionMatrix, translate(xoffset,yoffset,zoffset));

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

for(var x = 0 ; x < 5; x++){
    //Used to track which points to draw for each sphere
    var start;
    var numberOfVertices;
    var sphere = mat4();
    sphere = mult(sphere, translate(positionSun));
    sphere = mult(sphere, viewMatrix);
    sphere = mult(sphere, scale(enlarge[x], enlarge[x], enlarge[x]));
        
    if(x > 0){
        sphere = mult(sphere, rotate( speed[x-1] * time * selfRotateAngle/2, [0, 1, 0]));
        sphere = mult(sphere, translate(orbit[x-1],0,0));
        if(x == 3){
            bluePlanet = sphere;
        }
      }
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(sphere));

//Use switch statement to make each planet's lightening and color unique. 
    switch(x){
        case 0:

        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
        materialAmbient = vec4(1.0, 0.9, 0.3, 0.4);
        ambientProduct = mult(lightAmbient, materialAmbient);
        lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
        materialDiffuse = vec4(1.0, 0.9, 0.3, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        lightSpecular = vec4(0.4, 0.4, 0.4, 1.0);
        materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);
        shininess = 100;
    
        gl.uniform1f(phongShadingLoc, 1.0);
        start = 0;
        numberOfVertices = indexSun;
            break;
        
        case 1:
 
        lightAmbient = vec4(0.6, 0.6, 0.6, 0.3);
        materialAmbient = vec4(1.0, 1.0, 1.0, 0.8);
        ambientProduct = mult(lightAmbient, materialAmbient);
        lightDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
        materialDiffuse = vec4(0.9, 0.9, 0.9, 0.8);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        lightSpecular = vec4(1, 1, 1, 0.8);
        materialSpecular = vec4(1.0, 1.0, 1.0, 0.8);
        specularProduct = mult(lightSpecular, materialSpecular);
        shininess = 30; 
  
        gl.uniform1f(phongShadingLoc, 0.0);
        start = indexSun;
        numberOfVertices = indexP1 - indexSun;
            break;
        case 2:

        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
        materialAmbient = vec4(0.0, 0.9, 1.0, 1.0);
        ambientProduct = mult(lightAmbient, materialAmbient);
        lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
        materialDiffuse = vec4(0.65, 0.9, 1.0, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        lightSpecular = vec4(0.4, 0.4, 0.4, 1.0);
        materialSpecular = vec4(0.99, 0.4, 0.0, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);
        shininess = 30; 
        gl.uniform1f(phongShadingLoc, 0.0);
        start= indexP1;
        numberOfVertices = indexP2 - indexP1;
            break;
        case 3:
     
        lightAmbient = vec4(0.4, 0.4, 0.4, 1.0);
        materialAmbient = vec4(0.4, 0.6, 0.9, 0.8);
        ambientProduct = mult(lightAmbient, materialAmbient);
        lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
        materialDiffuse = vec4(0.4, 0.4, 0.7, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        lightSpecular = vec4(0.4, 0.4, 0.4, 1.0);
        materialSpecular = vec4(0.5, 0.6, 0.9, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);
        shininess = 30; 
      
        gl.uniform1f(phongShadingLoc, 1.0);
        start = indexP2;
        numberOfVertices = indexP3 - indexP2;
            break;
        case 4:

        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
        materialAmbient = vec4(0.9, 0.6, 0.3, 1.0);
        ambientProduct = mult(lightAmbient, materialAmbient);
        lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
        materialDiffuse = vec4(0.9, 0.6, 0.23, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        lightSpecular = vec4(0.4, 0.4, 0.4, 0.0);
        materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);
        shininess = 5; 

        gl.uniform1f(phongShadingLoc, 1.0);
        start = indexP3;
        numberOfVertices = indexP4 - indexP3;
            break;
        default:
            break;
        }

    //Push points through shaders.
        gl.uniform4fv(ambientProductLoc,  flatten(ambientProduct));
        gl.uniform4fv(diffuseProductLoc,  flatten(diffuseProduct));
        gl.uniform4fv(specularProductLoc, flatten(specularProduct));
        gl.uniform3fv(lightPositionLoc,  flatten(lightPosition));
        gl.uniform1f(shininessLoc,  shininess);

//Draw spheres
      gl.drawArrays(gl.TRIANGLES, start, numberOfVertices)
}

    var moon = mat4();
    moon = bluePlanet;
    moon = mult(moon, scale(.2, .2, .2));
    moon = mult( moon, rotate(-time * selfRotateAngle*2, [0, 1, 0]));
    moon = mult(moon, translate(9, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(moon));
    lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
    materialAmbient = vec4(0.5, 0.5, 0.5, 1.0);//vec4(0.7, 0.3, 0.0, 1.0);
    ambientProduct = mult(lightAmbient, materialAmbient);
    lightDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
    materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);
    materialSpecular = vec4(0.5, 0.5, 0.5, 1.0);
    specularProduct = mult(lightSpecular, materialSpecular);
    shininess = 50;

    // Push everything through to the shaders!
    gl.uniform4fv(ambientProductLoc,  flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc,  flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform3fv(lightPositionLoc,  flatten(lightPosition));
    gl.uniform1f(shininessLoc,  shininess);

    gl.drawArrays( gl.TRIANGLES, indexP4, indexMoon - indexP4);

    gl.uniformMatrix4fv(uniformViewMatrixLoc, false, flatten(viewMatrix));
    window.requestAnimFrame( render );
}





//Function that generates the points and normals of the sphere 
//ARGUMENTS: 
    //numberToSubdivide - number of times to subdivide triangles to create a smoother sphere
    //useFlatShading - bool to decide whether to use one normal per polygon/triangle face. 
    //isSun -bool to indicate that all normals to point outward for the sun.
function drawSphere(numberToSubdivide, useFlatShading, isSun) {
    divideTriangle(va, vb, vc, numberToSubdivide);
    divideTriangle(vd, vc, vb, numberToSubdivide);
    divideTriangle(va, vd, vb, numberToSubdivide);
    divideTriangle(va, vc, vd, numberToSubdivide);
    
    function triangle(a, b, c) {
        pointsArray.push(a, b, c);
     
        //push normal vectors    
        if(useFlatShading){
          var t1 = subtract(c,b);
          var t2 = subtract(c,a);
          var normal = vec4(normalize(cross(t1,t2)));
          if(isSun){
            normal = subtract(vec4(0,0,0,0), normal);
            }
            normalsArray.push(normal, normal, normal);
         }
        else{
         normalsArray.push(a, b, c);
       } 

       index += 3;
    }

    function divideTriangle(a, b, c, count) {
        if ( count <= 0 ) {  
            triangle(a, b, c);
        }
        else{ 
         var ab = mix( a, b, 0.5);
         var ac = mix( a, c, 0.5);
         var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
        }
   }

}



function handleKeyDown(event){
    switch(event.keyCode){
        case 37:
            //LEFT
            phi += 1; 
        break;
        case 38:
            //UP
            theta += 1; 
        break;
        case 39:
            //RIGHT
            phi -= 1;   
        break;
        case 40:
            //DOWN
            theta -= 1;
        break;
        case 82: 
            //RESET    
            xoffset = 0;
            yoffset = 0;
            phi = 0;
            theta = 0;
        break;
        case 73:
            //'i'
            yoffset -= 1;
        break;
        case 74:
            //'j'
            xoffset += 1;
        break;
        case 75:
            //'k'
            yoffset+=1;
        break;
        case 76:
            //'l'
            xoffset-=1;
        break;
        case 78:
            // 'n'
            fov -= 1;
        break;
        case 87:
            //'w'
            fov +=1
        break;
        default:
        break;
    }
}
