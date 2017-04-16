using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
[DefaultExecutionOrder(100)]
public class WheelView : MonoBehaviour {

    public SuspensionController SuspensionController {
        get {
            if (_SuspensionController == null)
                _SuspensionController = this.GetComponentInParent<SuspensionController>();
            return _SuspensionController;
        }
    }
    private SuspensionController _SuspensionController;

    private Vector3 _Position;
    private Quaternion _Rotation;

    void FixedUpdate() {
        SuspensionController.GetWorldPose(out _Position, out _Rotation);
        this.transform.position = _Position;
        this.transform.rotation = _Rotation * Quaternion.Euler(0, 90, 0);
    }
}
