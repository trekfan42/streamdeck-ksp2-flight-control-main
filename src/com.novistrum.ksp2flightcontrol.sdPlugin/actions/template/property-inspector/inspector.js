/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    console.log(jsn);
    console.log("Hello There")

});

const updateButton = function() {
    if($PI) {
        console.log("Action Group Selected")
        var payload = document.getElementById("agSelect").value;
        $PI.sendToPlugin(payload)
    }
    else {
        console.log("Action Group Not Selected")
    }
}


$PI.onDidReceiveGlobalSettings(({payload}) => {
    console.log('onDidReceiveGlobalSettings', payload);
})

