using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraArm : MonoBehaviour {

    public Rigidbody Target;
    public float Distance;
    public float Height;
    public float Damping;

    private Vector3 _Direction;

    void Start() {

    }

    void FixedUpdate() {
        this.transform.position = Vector3.Lerp(this.transform.position, GetTargetPosition(), Time.fixedDeltaTime * Damping);
        this.transform.LookAt(Target.transform, Vector3.up);
    }

    private Vector3 GetTargetPosition() {
        _Direction = Vector3.Lerp(Vector3.ProjectOnPlane(Target.transform.forward, Vector3.up).normalized, Vector3.ProjectOnPlane(Target.velocity, Vector3.up).normalized, Target.velocity.magnitude / 15);
        return Target.transform.position - _Direction * Distance + Vector3.up * Height;
    }
}
