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

    private float WheelInertia {
        get {
            return WheelMass * WheelRadius * WheelRadius / 2;
        }
    }

    private Rigidbody Rigidbody {
        get {
            if (_Rigidbody == null)
                _Rigidbody = this.GetComponentInParent<Rigidbody>();
            return _Rigidbody;
        }
    }
    private Rigidbody _Rigidbody;

    private Ray _Ray;
    private RaycastHit _Hit;
    private float _DampingForce;
    private float _CompressonForce;
    private float _CoiloverForce;
    private float _CurrentCompressionDistance;
    private float _PreviousCompressionDistance;
    private Vector3 _WheelPosition;
    private float _WheelRotationSpeed;
    private float _WheelRotationAngle;
    private float _LonSpeed;
    private float _LatSpeed;
    private float _LonSlip;
    private float _LatSlip;
    private float _LonForce;
    private float _LatForce;

    void FixedUpdate() {
        UpdateCoilovers();
        UpdateWheels();
    }

    private void UpdateCoilovers() {
        _Ray.direction = -this.transform.up;
        _Ray.origin = this.transform.position;
        if (Physics.Raycast(_Ray, out _Hit, TravelDistance + WheelRadius)) {
            _PreviousCompressionDistance = _CurrentCompressionDistance;
            _CurrentCompressionDistance = (TravelDistance + WheelRadius - _Hit.distance);
            _CompressonForce = _CurrentCompressionDistance * SpringStiffness;
            _DampingForce = (_CurrentCompressionDistance - _PreviousCompressionDistance) * DamperStiffness;
            _CoiloverForce = _CompressonForce + _DampingForce;
            _WheelPosition = this.transform.position - this.transform.up * (_Hit.distance - WheelRadius);
            Rigidbody.AddForceAtPosition(-_Ray.direction * _CoiloverForce, this.transform.position);
        }
        else {
            _CoiloverForce = 0;
            _WheelPosition = this.transform.position - this.transform.up * TravelDistance;
        }
    }

    private void UpdateWheels() {
        _LonSpeed = Vector3.Dot(this.transform.forward, Rigidbody.GetPointVelocity(this.transform.position));
        _LatSpeed = Vector3.Dot(this.transform.right, Rigidbody.GetPointVelocity(this.transform.position));

        if (Mathf.Abs(_LonSpeed) > 0 && _Hit.collider != null) {
            _LonSlip = (_WheelRotationSpeed * WheelRadius - _LonSpeed) / Mathf.Abs(_LonSpeed);
            _LonForce = _CoiloverForce * Mathf.Sign(_LonSlip) * WheelFrictionConfig.Instance.LongtitudeFrictionCurve.Evaluate(Mathf.Abs(_LonSlip));
            Rigidbody.AddForceAtPosition(this.transform.forward * _LonForce, this.transform.position); // WRONG POSITION AND DIRECTION!!!!
        }
        else {
            _LonSlip = 0;
            _LonForce = 0;
        }

        if (Mathf.Abs(_LatSpeed) > 0) {
            //_LatSlip = _LatSpeed;
            //Rigidbody.AddForceAtPosition(-this.transform.right * _CoiloverForce * Mathf.Sign(_LatSlip) * WheelFrictionConfig.Instance.LatitudeFrictionCurve.Evaluate(Mathf.Abs(_LatSlip)), this.transform.position);
        }

        _WheelRotationSpeed += ((-_LonForce * WheelRadius) / WheelInertia) * Time.fixedDeltaTime;
        _WheelRotationAngle += (_WheelRotationAngle + _WheelRotationSpeed * Mathf.Rad2Deg * Time.fixedDeltaTime) % 180;
    }

    public void GetWorldPose(out Vector3 position, out Quaternion rotation) {
        if (Application.isPlaying) {
            position = _WheelPosition;
        }
        else {
            position = this.transform.position - this.transform.up * TravelDistance;
        }
        rotation = this.transform.rotation * Quaternion.Euler(_WheelRotationAngle, 0, 0);
    }


#if UNITY_EDITOR
    void OnDrawGizmos() {
        var axlePosition = this.transform.position - this.transform.up * (_Hit.collider != null ? _Hit.distance - WheelRadius : TravelDistance);
        Handles.color = Color.yellow;
        Handles.DrawLine(this.transform.position, axlePosition);
        Handles.color = Color.green;
        Handles.DrawWireDisc(axlePosition, this.transform.right, WheelRadius);
        Handles.DrawLine(axlePosition, axlePosition + this.transform.forward * _LonSlip);
    }
#endif
}
