using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class LastLogMessage : MonoBehaviour {

    private Text _Text;

	// Use this for initialization
	void Start () {
        _Text = this.GetComponent<Text>();
        Application.logMessageReceived += (cond, trace, type) => {
            var color = Color.white;
            if (type == LogType.Exception || type == LogType.Error || type == LogType.Assert) {
                color = Color.red;
            }
            if (type == LogType.Warning) {
                color = Color.yellow;
            }

            _Text.color = color;
            _Text.text = cond;
        };
	}
	
	// Update is called once per frame
	void Update () {
	}
}
