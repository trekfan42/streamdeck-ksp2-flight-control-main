/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />


const ActionGroupToggle = new Action('com.novistrum.ksp2flightcontrol.action');

const buttons = [];

const images = {
    "ActionGroup": {
        "True": {
            "SolarPanels": "Buttons/ActionGroup/True/SolarPanels.png",
            "Lights": "Buttons/ActionGroup/True/Lights.png",
            "Gear": "Buttons/ActionGroup/True/Gear.png",
            "Brakes": "Buttons/ActionGroup/False/Brakes.png", /// May need fixing in the future
            "RadiatorPanels": "Buttons/ActionGroup/True/RadiatorPanels.png",
            "Science": "Buttons/ActionGroup/True/Science.png",
            "RCS": "Buttons/ActionGroup/True/RCS.png",
            "SAS": "Buttons/ActionGroup/True/SAS.png",
            "Custom01": "Buttons/ActionGroup/True/Custom01.png",
            "Custom02": "Buttons/ActionGroup/True/Custom02.png",
            "Custom03": "Buttons/ActionGroup/True/Custom03.png",
            "Custom04": "Buttons/ActionGroup/True/Custom04.png",
            "Custom05": "Buttons/ActionGroup/True/Custom05.png",
            "Custom06": "Buttons/ActionGroup/True/Custom06.png",
            "Custom07": "Buttons/ActionGroup/True/Custom07.png",
            "Custom08": "Buttons/ActionGroup/True/Custom08.png",
            "Custom09": "Buttons/ActionGroup/True/Custom09.png",
            "Custom10": "Buttons/ActionGroup/True/Custom10.png"
        },
        "False": {
            "SolarPanels": "Buttons/ActionGroup/False/SolarPanels.png",
            "Lights": "Buttons/ActionGroup/False/Lights.png",
            "Gear": "Buttons/ActionGroup/False/Gear.png",
            "Brakes": "Buttons/ActionGroup/True/Brakes.png", /// May need fixing in the future
            "RadiatorPanels": "Buttons/ActionGroup/False/RadiatorPanels.png",
            "Science": "Buttons/ActionGroup/False/Science.png",
            "RCS": "Buttons/ActionGroup/False/RCS.png",
            "SAS": "Buttons/ActionGroup/False/SAS.png",
            "Custom01": "Buttons/ActionGroup/False/Custom01.png",
            "Custom02": "Buttons/ActionGroup/False/Custom02.png",
            "Custom03": "Buttons/ActionGroup/False/Custom03.png",
            "Custom04": "Buttons/ActionGroup/False/Custom04.png",
            "Custom05": "Buttons/ActionGroup/False/Custom05.png",
            "Custom06": "Buttons/ActionGroup/False/Custom06.png",
            "Custom07": "Buttons/ActionGroup/False/Custom07.png",
            "Custom08": "Buttons/ActionGroup/False/Custom08.png",
            "Custom09": "Buttons/ActionGroup/False/Custom09.png",
            "Custom10": "Buttons/ActionGroup/False/Custom10.png"
        }
    },

    "SAS": {
        "StabilityAssist": ""
    },

    "Other": {
        "Blank": "",
        "Launch": "",
        "Stage": "",
        "Abort": "",
        "RCS": "",
        "SAS": "",

    }
};


$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
    
});





/// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};



function imgToBase64(url, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        callback(dataURL);
    };
    img.src = url;
};

function imgToBG(context, type, name, status) {
    var imageUrl = "";

    // Check if status is defined and not falsy
    if (status) {
        imageUrl = images[type] && images[type][status] && images[type][status][name];
    } else {
        imageUrl = images[type] && images[type][name];
    }

    if (imageUrl) {
        imgToBase64(imageUrl, function (base64Img) {
            $SD.setImage(context, base64Img);
        });
    } else {
        console.error(`Image URL not found for type: ${type}, name: ${name}, status: ${status}`);
        console.log('images:', images);
        console.log('type:', type);
        console.log('status:', status);
        console.log('name:', name);
    }
};


/// This function should be called when a new button is added from the Property Inspector
function addButtonFromPropertyInspector(context, name) {
    try {
        addButton(context, name);

        /// Check Action Group Status in Game
        updateButtonState(buttons[buttons.length - 1]); /// Update the state immediately
    } catch (error) {
        console.error('Error adding button from Property Inspector:', error);
    }
};

/// Function to handle adding a new button to the buttons array
function addButton(context, name) {
    const type = checkType(name);
    // Check if a button with the same context already exists
    const existingButton = buttons.find(button => button.context === context);
    
    if (!existingButton) {
        // If no match is found, add the new button
        buttons.push({ context, type, name});
        console.log("Button added:", { context, type, name });
    } else {
        // If a match is found, log a message (you can customize this behavior)
        console.log("Button with context already exists:", context);
    }

    // Log the current state of the buttons array
    console.log("Buttons:", buttons);
};

/// Function to make the API request to get the action group state
function getActionGroupState(button) {
    const requestBody = {
        "ID": "424242",
        "Action": "getActionGroupState",
        "parameters": {
            "ID": button.name
        }
    };

    return fetch('http://127.0.0.1:8080/api', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Returned State:", data.Data.Status);
        return data.Data.Status !== undefined ? data.Data.Status : null;
    })
    .catch(error => {
        console.error('Error getting action group state:', error);
        return null;
    });
};

/// Function to update the state of a single button
async function updateButtonState(button) {
    var status = null;
    if (button.type === "ActionGroup") {
        console.log("Button is Action group, getting state...")
        const currentState = await getActionGroupState(button);
        status = currentState;
    };
    
    imgToBG(button.context, button.type, button.name , status)

};

// Function to periodically update button states
function updateButtonStates() {
    console.log("Updating button states...");
    buttons.forEach(button => {
        updateButtonState(button);
    });
};

function checkType(name) {
    var type = "Other";

    if ( name in images["ActionGroup"]["True"]) {
        type = "ActionGroup";
    } ;
    if ( name in images["SAS"]) {
        type = "SAS";
    };

    return type
};



ActionGroupToggle.onKeyUp(({ context, payload }) => {
    console.log('Key up event received');
    console.log(payload.settings.action);

    ///addButtonFromPropertyInspector(context, payload.settings.action)

    /// Generate a random 6-character string
    const randomUser = generateRandomString(6);

    try {
        const requestBody = {
            "ID": randomUser,
            "Action": "setActionGroupState",
            "parameters": {
                "ID": payload.settings.action
            }
        };

        fetch('http://127.0.0.1:8080/api', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            /// Handle the response data as needed
			console.log("Status:", data.Data.Status);

            imgToBG(context, checkType(payload.settings.action), payload.settings.action, data.Data.Status)

        })
        .catch(error => {
            console.error('Error sending POST request:', error);
        });
    } catch (error) {
        console.error('Error constructing JSON:', error);
    }
});

ActionGroupToggle.onDidReceiveSettings(({context, payload}) => {
    console.log('Received settings from Property Inspector:', payload);
    console.log(context);
    
    const storedValue = payload.settings.action || 'None';
    console.log('Stored Value:', storedValue);
    addButtonFromPropertyInspector(context, storedValue);

    buttons.forEach(button => {
        if (context === button.context) {
            var index = buttons.findIndex(button => button.context === context);
            console.log('Button name when adding:', buttons[index].name);
            button.name = storedValue;
            button.type = checkType(storedValue);
            console.log(buttons[index]);
        }
    });
});

ActionGroupToggle.onDialRotate(({ action, context, device, event, payload }) => {
	console.log('Your dial code goes here!');
});

ActionGroupToggle.onSendToPlugin(({ ActionGroup }) => {
	console.log('Action Group Selection received');
});


ActionGroupToggle.onWillAppear(({ context }) => {
    // Retrieve the settings for the button using the context
    const settings = $SD.getSettings(context);

    // Check if settings are available
    if (settings) {
        addButton(context, settings.action);
        console.log(buttons);
    } else {
        console.error('Settings not available for context:', context);
    }
    updateButtonStates();
});

ActionGroupToggle.onWillDisappear(({ context }) => {
    const indexToRemove = buttons.findIndex(button => button.context === context);
    
    if (indexToRemove !== -1) {
        buttons.splice(indexToRemove, 1);
    }

    console.log(buttons);
});


