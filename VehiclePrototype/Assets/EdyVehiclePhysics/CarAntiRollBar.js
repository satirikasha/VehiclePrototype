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
// CarAntiRollBar
//
// Provides anti-roll bar simulation. Use one script per axle. 
//
//========================================================================================================================

#pragma strict

// Par�metros

var WheelL : WheelCollider; 
var WheelR : WheelCollider; 
var AntiRoll = 5000.0; 
var AntiRollFactor = 1.0;
var AntiRollBias = 0.5;
var StrictMode : int = 0;

// Datos para telemetr�a

private var m_extensionL = 0.0;
private var m_extensionR = 0.0;
private var m_antiRollForce = 0.0;
private var m_antiRollRatio = 0.0;

function getExtensionL() : float { return m_extensionL; }
function getExtensionR() : float { return m_extensionR; }
function getAntiRollForce() : float { return m_antiRollForce; }
function getAntiRollRatio() : float { return m_antiRollRatio; }
function getAntiRollTravel() : float { return m_extensionL - m_extensionR; }

// Implementaci�n de la barra estabilizadora

function FixedUpdate () 
	{ 
	var hitL : WheelHit; 
	var hitR : WheelHit;

	var groundedL = WheelL.GetGroundHit(hitL); 	
	if (groundedL) 
		m_extensionL = (-WheelL.transform.InverseTransformPoint(hitL.point).y - WheelL.radius) / WheelL.suspensionDistance;
	else
		m_extensionL = 1.0;

	var groundedR = WheelR.GetGroundHit(hitR); 
	if (groundedR)
		m_extensionR = (-WheelR.transform.InverseTransformPoint(hitR.point).y - WheelR.radius) / WheelR.suspensionDistance;
	else
		m_extensionR = 1.0;

	m_antiRollRatio = Bias(m_extensionL - m_extensionR, AntiRollBias);
	m_antiRollForce = m_antiRollRatio * AntiRoll * AntiRollFactor;
	
	// Modo Strict: Afecta al caso en que una rueda est� levantada y la otra apoyada. 
	// Si se quita una fuerza en un sitio, reponerla en otro para mantener el peso total constante.
	// 
	// - Strict 0: desactivado, s�lo hay fuerza en la rueda apoyada.
	// - Strict 1: reponer la fuerza de la rueda levantada en el centro de masas.
	// - Strict 2: aplicar las fuerzas en las ruedas independientemente de que est�n apoyadas o no.

    if (groundedL || StrictMode == 2)
        GetComponent.<Rigidbody>().AddForceAtPosition(WheelL.transform.up * -m_antiRollForce, WheelL.transform.position);
	else if (StrictMode == 1)
		GetComponent.<Rigidbody>().AddForce(WheelL.transform.up * -m_antiRollForce);

    if (groundedR || StrictMode == 2) 
        GetComponent.<Rigidbody>().AddForceAtPosition(WheelR.transform.up * m_antiRollForce, WheelR.transform.position); 
	else if (StrictMode == 1)
		GetComponent.<Rigidbody>().AddForce(WheelL.transform.up * m_antiRollForce);
	}
	

private var m_lastExponent = 0.0;
private var m_lastBias = -1.0;

private function BiasRaw(x : float, fBias : float) : float
	{
	if (x <= 0.0) return 0.0;
	if (x >= 1.0) return 1.0;

	if (fBias != m_lastBias)
		{
		if (fBias <= 0.0) return x >= 1.0? 1.0 : 0.0;
		else if (fBias >= 1.0) return x > 0.0? 1.0 : 0.0;
		else if (fBias == 0.5) return x;

		m_lastExponent = Mathf.Log(fBias) * -1.4427;
		m_lastBias = fBias;
		}

	return Mathf.Pow(x, m_lastExponent);
	}

	
// Bias sim�trico usando s�lo la curva inferior (fBias < 0.5)
// Admite rango -1, 1 aplicando efecto sim�trico desde 0 hacia +1 y -1.

private function Bias(x : float, fBias : float) : float
	{
	var fResult : float;
		
	fResult = fBias <= 0.5? BiasRaw(Mathf.Abs(x), fBias) : 1.0 - BiasRaw(1.0 - Mathf.Abs(x), 1.0 - fBias);
	
	return x<0.0? -fResult : fResult;
	}









	

/* POR PROBAR:

Unir la rueda al veh�culo mediante un Joint configurable. 
En reposo, sin barra, el joint mantiene el wheelcollider en su posici�n original mientras �sta hace su tarea normal.
Con la barra en acci�n, un joint sube su rueda mientras el otro baja la suya, intentando llegar a una posici�n
objetivo con una fuerza determinada.

DEBEMOS SEGUIR UN TUTORIAL DE JOINTS en primer lugar.

PROBLEMA: Los l�mites no son "DUROS", se indica una fuerza o muelle para mantenerse dentro del l�mite. Habr�a que probar.

-----

Tambi�n probar a mover la rueda usando el centro del collider en vez del transform del gameobject.
Cambiar el par�metro en real-time produce el mismo efecto que configurarlo
desde el principio. Los cambios en posici�n del gameobject en real-time NO son cosistentes: dan resultados distintos.

IMPORTANTE: CAMBIAR PAR�METROS EN CUALQUIER COLLIDER RECALCULA EL CENTRO DE MASAS.


Otras posibles implementaciones probadas:


- Doblando la fuerza en la rueda interior, para compensar la p�rdida de agarre en la exterior:
  MUY INTERESANTE! Mucho m�s agarre, parece "pedir" unos nuevos par�metros de curva, para esta nueva situaci�n.
  Pero las p�rdidas de adherencia (ej. al levantarse la rueda interior, o en irregularidades del terreno) son m�s cantosas.
  Esperar a tener velocidad m�xima, gearbox, etc.
  
	if (groundedL)
		{
		tmp = 1.0;
		if (m_antiRollForce > 0) tmp *= 2.0;
        rigidbody.AddForceAtPosition(WheelL.transform.up * -m_antiRollForce*tmp, WheelL.transform.position); 
		}
  

- Ajustando los muelles de la suspensi�n: no va bien. Se puede hacer que coja el valor correctamente sumando Epsilon a la distancia de
  suspensi�n (provoca recalcular pero no modifica la distancia). Pero los cambios parecen provocar que el muelle acabe
  comprimido en el valor m�s bajo que se le d�, hasta que se expanda de forma natural. Endurecer el muelle din�micamente
  tampoco parece tener efecto notable. FIN DE LA HISTORIA.
- Ponderando la fuerza con la normal del terreno: inadecuado.
- Limitando la fuerza a aplicar seg�n la fuerza que haya en los muelles: reduce enormemente la eficiacia.

- Calculando la estabilizaci�n en funci�n de la diferencia de cargas de la ruedas (hit.force: (R-L) / (R+L)): provoca inestabilidad.
	Variante: ponderando con el muelle. Provoca inestabilidad.

		m_extensionR = Mathf.Clamp01(hitR.force / WheelR.suspensionSpring.spring);



- Moviendo la posici�n de los WheelColliders: 
	No es posible matener la posici�n sincronizada con la extensi�n de la suspensi�n: si movemos el collider para
	ocupar la posici�n libre de la suspensi�n, entonces va oscilando. Habr�a que conocer la posici�n del muelle en reposo.
	Mover la posici�n todo el recorrido de la suspensi�n NO genera fuerza anti-roll.
	Mover la posici�n mucho provoca inestabilidad, y sigue sin generar fuerza anti-roll. FIN DE LA HISTORIA.

	m_antiRollForce = (m_extensionL - m_extensionR) * WheelL.suspensionDistance * AntiRollFactor;

	WheelL.transform.localPosition.y = m_startPosL + m_antiRollForce*2;
	WheelR.transform.localPosition.y = m_startPosR - m_antiRollForce*2;

	
- Usando Configurable Joint: No parece que haya una configuraci�n que permita al weelcollider mantenerse fijo en
	comportamiento normal. La idea ser�a a�adir fuerza desde la posici�n normal, pero parece jodido.	


- Aplicando fuerza en todo momento, tanto si las ruedas est�n levantadas como si no.
	Maximiza enormemente el efecto de la barra, pero falsea la caida natural y el equilibrio sobre dos ruedas.
	Variante: aplicar fuerza directamente abajo (transform.up) en las ruedas levantadas: Pr�cticamente igual.

        rigidbody.AddForceAtPosition(WheelL.transform.up * -m_antiRollForce, WheelL.transform.position); 
        rigidbody.AddForceAtPosition(WheelR.transform.up * m_antiRollForce, WheelR.transform.position); 

		

- Aplicando fuerza en ambas ruedas si est�n en el suelo, y s�lo en la rueda levantada si la otra est� posada.
	Bastante bien, pero falsea el efecto de caida natural y el equilibrio sobre 2 ruedas.

	if (groundedL && groundedR)
		{
        rigidbody.AddForceAtPosition(WheelL.transform.up * -m_antiRollForce, WheelL.transform.position);
        rigidbody.AddForceAtPosition(WheelR.transform.up * m_antiRollForce, WheelR.transform.position);
		}
	else
	if (groundedL)
        rigidbody.AddForceAtPosition(WheelR.transform.up * m_antiRollForce, WheelR.transform.position);
	else
	if (groundedR)
        rigidbody.AddForceAtPosition(WheelL.transform.up * -m_antiRollForce, WheelL.transform.position);		
*/










