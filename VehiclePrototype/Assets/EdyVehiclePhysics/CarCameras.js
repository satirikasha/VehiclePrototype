//========================================================================================================================
// Edy Vehicle Physics - (c) Angel Garcia "Edy" - Oviedo, Spain
// http://www.edy.es/dev/vehicle-physics
// 
// Terms & Conditions:
//  - Use for unlimited time, any number of projects, royalty-free.
//  - Keep the copyright notices on top of the source files.
//  - Resale or redistribute as anything except a final product to the end user (asset / library / engine / middleware / etc.) is not allowed.
//  - Put me (Angel Garcia "Edy") in your game's credits as author of the vehicle physics.
//
// Bug reports, improvements to the code, suggestions on further developments, etc are always welcome.
// Unity forum user: Edy
//========================================================================================================================
//
// CarCameras
//
// Manages the vehicle-specific camera settings, including mirror cameras, vehicle cameras, and view parameters.
//
//========================================================================================================================

#pragma strict

var showFixedCams = false;
var startupFixedCam = 0;
var FixedCameras : Camera[];

var MirrorLeft : Camera;
var MirrorRight : Camera;
var MirrorRear : Camera;

var CameraLookAtPoint : Transform;
var DriverFront : Transform;

var viewDistance = 10.0;
var viewHeight = 3.5;
var viewDamping = 3.0;
var viewMinDistance = 3.8;
var viewMinHeight = 0.0;


private var m_currentFixedCam : int;
private var m_DriverViewAngles : Vector3;


function getDriverViewAngles () { return m_DriverViewAngles; }


function Start ()
	{
	m_currentFixedCam = startupFixedCam;
	if (m_currentFixedCam >= FixedCameras.length) m_currentFixedCam = -1;
	
	for (var i=0; i<FixedCameras.length; i++)
		FixedCameras[i].enabled = false;
	
	// Desactivar c�maras espejo: se gestionar�n desde CameraControl
	
	if (MirrorLeft) MirrorLeft.enabled = false;
	if (MirrorRight) MirrorRight.enabled = false;
	if (MirrorRear) MirrorRear.enabled = false;
	
	// Desactivar script de movimiento de c�mara del conductor, si hay. Se gestionar� tambi�n desde CameraControl.
	
	if (DriverFront)
		{
		var scrDriverMove : CamFreeView = DriverFront.GetComponent(CamFreeView) as CamFreeView;
		if (scrDriverMove) scrDriverMove.enabled = false;
		
		m_DriverViewAngles = DriverFront.localEulerAngles;
		}
	}


function Next ()
	{
	if (FixedCameras.length == 0) return;
	
	if (m_currentFixedCam >= 0)
		{
		FixedCameras[m_currentFixedCam++].enabled = false;
		if (m_currentFixedCam < FixedCameras.length)
			FixedCameras[m_currentFixedCam].enabled = true && showFixedCams;
		else
			m_currentFixedCam = -1;
		}
	else
		{
		m_currentFixedCam = 0;
		FixedCameras[m_currentFixedCam].enabled = true && showFixedCams;
		}
	}


function Update () 
	{
	// Si tenemos c�mara activa y ha cambiado el estado de showFixedCams, mostrar u ocultar seg�n sea apropiado.
	
	if (m_currentFixedCam >= 0)
		{
		if (showFixedCams && !FixedCameras[m_currentFixedCam].enabled)
			FixedCameras[m_currentFixedCam].enabled = true;
		
		if (!showFixedCams && FixedCameras[m_currentFixedCam].enabled)
			FixedCameras[m_currentFixedCam].enabled = false;
		}
	}


	
/*	
## Renderizar c�maras en texturas GUI


#### 1. Textura tipo RenderTexture

Recibe las im�genes renderizadas por las c�maras. Es un _Asset_ similar a una textura normal, pero 
de tipo RenderTexture. 

Se crea en __Assets > Create > Render Texture__. Usar dimensiones adecuadas seg�n el uso que se le 
vaya a dar a la textura. Recomendable cuadrada.

UPDATE: Se puede hacer la RenderTexture con la misma proporci�n que la imagen resultante en pantalla. 
	Entonces bastar� con mantener la proporci�n 1:1 al poner la GUITexture, sin andar con milongas.

#### 2. C�maras con Target Texture

Mandan las im�genes a la textura indicada en (1). 

El _Normalized Viewport Rect_ debe tener las proporciones de la imagen resultante que se va a mostrar. 
Por ejemplo, si se usa el render a textura para simular la imagen de una TV a 4:3, usar esta misma 
proporci�n en el Viewport Rect.

En la textura se rellena la parte indicada en en el Rect, dejando el resto sin actualizar. La 
RenderTexture debe limpiarse al inicio de la aplicaci�n para asegurar que las zonas no actualizadas 
queden transparentes.

#### 3. Mostrar la textura con GUITexture

Muestra la textura en el espacio de la pantalla.

Se crea en __GameObject > Create Other > GUI Texture__. La c�mara principal de la escena (no las 
c�maras con Target Texture) debe estar activa y tener un componente _GUILayer_ para que se muestre.

__La transformaci�n resultante del objeto GUITexture debe ser la identidad__ (posici�n 0, rotaci�n 0, 
escalado 1), lo que extiende la textura para abarcar toda la pantalla. Dejar _Border_ y _Pixel Inset_ 
a cero. Entonces se pueden usar la posici�n y el escalado en X e Y para ajustar la posici�n y el 
tama�o de la textura en la pantalla. El color natural es gris 128 (se aplica HDR, por encima de 128 
sobreexpone). La posici�n Z determina el orden en que se superponen diferentes GUITextures.

El escalado de la GUITexture debe tener la proporci�n contraria a la pantalla (ej. 10:16 para 
pantalla 16:10). Se puede usar escalado negativo para invertir la imagen (_flip_).

La c�mara que renderiza a GUITexture debe renderizar alpha opaco. Cualquier informaci�n de 
transparencia, aunque no sea visible en la c�mara normal, se trasladar� al renderizar la GUITexture, 
mostr�ndose transparente en esos puntos. Se puede hacer bien asegur�ndose que todos los objetos tenga 
alpha opaco, o bien con un shader de imagen que elimine las transparencias.

*/