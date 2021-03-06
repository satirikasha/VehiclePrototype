﻿using UnityEngine;
using System.Collections;
using System;

public class SingletonBehaviour<T> : MonoBehaviour where T : MonoBehaviour {

    public static T Instance {
        get {
            return _Instance;
        }
        private set {
            _Instance = value;
        }
    }
    private static T _Instance;

    protected virtual void Awake() {
        Register();
    }

    protected virtual void OnEnable() {
        Register();
    }

    protected virtual void OnDestroy() {
        Unregister();
    }

    private void Register() {
        if (Instance != this) {
            if (Instance == null) {
                Instance = this as T;
            }
            else {
                throw new Exception("Attempted to register second singleton instance of type " + Instance.GetType().Name);
            }
        }
    }

    private void Unregister() {
        Instance = null;
    }
}
