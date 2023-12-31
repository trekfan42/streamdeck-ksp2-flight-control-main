/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    console.log("Property Inspector connected");

});

const updateButton = function() {
    if($PI) {
        console.log("Action Group Selected")
        var ActionGroup = document.getElementById("agSelect").value;
        console.log("Inspector Selected Action Group:", ActionGroup)
        $PI.setSettings({ action: ActionGroup });
        
    }

}




$PI.onDidReceiveSettings(({ payload }) => {
    console.log('onDidReceiveSettings', payload);
    const selectedValue = payload.settings.action || 'None';
    document.getElementById("agSelect").value = selectedValue;
});

$PI.onDidReceiveGlobalSettings(({ payload }) => {
    console.log('onDidReceiveGlobalSettings', payload);
    const selectedValue = payload.settings.action || 'None';
    document.getElementById("agSelect").value = selectedValue;
});