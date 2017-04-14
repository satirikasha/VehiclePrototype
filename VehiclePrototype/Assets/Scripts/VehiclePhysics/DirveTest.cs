using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DirveTest : MonoBehaviour {

    public bool Steer;
    public bool Drive;
    public float Torque = 1500;

    private WheelCollider _WheelCollider;

    void Start() {
        _WheelCollider = this.GetComponent<WheelCollider>();
    }

    //void Update() {
    //    if (Steer)
    //        _WheelCollider.steerAngle = Mathf.LerpUnclamped(0, 45, Input.GetAxis("Horizontal"));
    //    if (Drive)
    //        _WheelCollider.motorTorque = Torque * Input.GetAxis("Vertical");
    //}
}
