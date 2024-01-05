/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    console.log("Property Inspector connected");
    $PI.setSettings({"layout": "$B2"});
    console.log(jsn.actionInfo.payload.settings)
});
