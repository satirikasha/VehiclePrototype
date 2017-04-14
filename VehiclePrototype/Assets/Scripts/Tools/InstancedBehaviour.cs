using UnityEngine;
using System.Collections;
using System;

public class InstancedBehaviour<T> : MonoBehaviour where T : MonoBehaviour {

    public static T Instance {
        get {
            if (_Instance == null) {
                _Instance = new GameObject(typeof(T).Name, typeof(T)).GetComponent<T>();
            }
            return _Instance;
        }
        private set {
            _Instance = value;
        }
    }
    private static T _Instance;

    protected virtual void OnDestroy() {
        Unregister();
    }

    private void Unregister() {
        Instance = null;
    }
}
