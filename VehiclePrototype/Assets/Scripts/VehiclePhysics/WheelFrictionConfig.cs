using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WheelFrictionConfig : SingletonScriptableObject<WheelFrictionConfig> {

    public AnimationCurve LatitudeFrictionCurve;
    public AnimationCurve LongtitudeFrictionCurve;
}
