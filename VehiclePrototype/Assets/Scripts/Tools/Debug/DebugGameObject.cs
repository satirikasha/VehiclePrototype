using UnityEngine;
using System.Collections;

public class DebugGameObject : MonoBehaviour {

    void Awake() {
        if (!Debug.isDebugBuild)
            this.gameObject.SetActive(false);
    }
}
