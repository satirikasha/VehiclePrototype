using System.Collections;
using System.Collections.Generic;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class SuspensionController : MonoBehaviour {

    [Header("Coilover")]
    public float TravelDistance = 0.5f;
    public float SpringStiffness = 300000;
    public float DamperStiffness = 4000;
    [Header("Wheel")]
    public float WheelRadius = 0.5f;
    public float WheelMass = 15;

    public RaycastHit WheelHit {
        get {
            return _Hit;
        }
    }

    private Rigidbody Rigidbody {
        get {
            if(_Rigidbody == null)
                _Rigidbody = this.GetComponentInParent<Rigidbody>();
            return _Rigidbody;
        }
    }
    private Rigidbody _Rigidbody;

    private Ray _Ray;
    private RaycastHit _Hit;
    private float _DampingForce;
    private float _CompressonForce;
    private float _CurrentCompressionDistance;
    private float _PreviousCompressionDistance;
    private Vector3 _WheelPosition;

    void FixedUpdate() {
        var a = WheelFrictionConfig.Instance;
        UpdateCoilovers();
    }

    private void UpdateCoilovers() {
        _Ray.direction = -this.transform.up;
        _Ray.origin = this.transform.position;
        if (Physics.Raycast(_Ray, out _Hit, TravelDistance + WheelRadius)) {
            _PreviousCompressionDistance = _CurrentCompressionDistance;
            _CurrentCompressionDistance = (TravelDistance + WheelRadius - _Hit.distance);
            _CompressonForce = _CurrentCompressionDistance * SpringStiffness;
            _DampingForce = (_CurrentCompressionDistance - _PreviousCompressionDistance) * DamperStiffness;
            Rigidbody.AddForceAtPosition(-_Ray.direction * (_CompressonForce + _DampingForce), this.transform.position);
        }
    }

    public void GetWorldPose(out Vector3 position, out Quaternion rotation) {
        position = this.transform.position - this.transform.up * (_Hit.collider != null ? _Hit.distance - WheelRadius : TravelDistance);
        rotation = this.transform.rotation;
    }


#if UNITY_EDITOR
    void OnDrawGizmos() {
        var axlePosition = this.transform.position - this.transform.up * (_Hit.collider != null ? _Hit.distance - WheelRadius : TravelDistance);
        Handles.color = Color.yellow;
        Handles.DrawLine(this.transform.position, axlePosition);
        Handles.color = Color.green;
        Handles.DrawWireDisc(axlePosition, this.transform.right, WheelRadius);
    }
#endif
}
