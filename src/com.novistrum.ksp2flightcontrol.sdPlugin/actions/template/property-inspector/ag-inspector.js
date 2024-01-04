/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    console.log("Property Inspector connected");
    console.log(jsn.actionInfo.payload.settings.action)
    let selectedValue = jsn.actionInfo.payload.settings.action || 'None';
    document.getElementById("agSelect").value = selectedValue;

});

const updateButton = function() {
    if($PI) {
        console.log("Action Group Selected")
        var ActionGroup = document.getElementById("agSelect").value;
        console.log("Inspector Selected Action Group:", ActionGroup);
        $PI.setSettings({ action: ActionGroup});
        
    }

}
