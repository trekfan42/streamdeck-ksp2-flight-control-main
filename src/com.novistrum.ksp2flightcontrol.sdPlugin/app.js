/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

// Build Command:
// .\DistributionTool.exe -b -i src\com.novistrum.ksp2flightcontrol.sdPlugin -o Release


const myAction = new Action('com.novistrum.ksp2flightcontrol.action');

const buttons = [];

const updateInterval = setInterval(updateButtonStates, 1000);

const images = [{
    "SolarPanels": "Buttons/agSolar.png",
    "Lights": "actions/template/assets/agLights.png",
    "Custom01": "actions/template/assets/ag1.png"
}]

function convertImgToBase64(url, callback) {
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
}

function imgToBase64(context, actionGroup) {
    const imageUrl = images[0][actionGroup];
    convertImgToBase64(imageUrl, function (base64Img) {
        $SD.setImage(context, base64Img);
    });
}

$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
});


/// Function to handle adding a new button to the buttons array
function addButton(context, actionGroup) {
    // Check if a button with the same context already exists
    const existingButton = buttons.find(button => button.context === context);

    if (!existingButton) {
        // If no match is found, add the new button
        buttons.push({ context, actionGroup, lastState: null });
        console.log("Button added:", { context, actionGroup });
    } else {
        // If a match is found, log a message (you can customize this behavior)
        console.log("Button with context already exists:", context);
    }

    // Log the current state of the buttons array
    console.log("Buttons:", buttons);
}

/// Function to make the API request to get the action group state
function getActionGroupState(button) {
    const requestBody = {
        "ID": "424242",
        "Action": "getActionGroupState",
        "parameters": {
            "ID": button.actionGroup
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
    .then(data => data.state)
	.catch(error => {
        console.error('Error getting action group state:', error);
        return null;
    });
	
}

/// Function to update the state of a single button
async function updateButtonState(button) {
    const currentState = await getActionGroupState(button);


    // Update button state only if the state has changed
    if (currentState !== null && currentState !== button.lastState) {
        button.lastState = currentState; // Update last known state
		
		$SD.setState(button.context, currentState);

		console.log('API Response Data:', currentState);
    }
}

// Function to periodically update button states
function updateButtonStates() {
	console.log("updating button states")
    buttons.forEach(button => {
        updateButtonState(button);
    });
}

/// Example: Add a new button from the Property Inspector
/// This function should be called when a new button is added from the Property Inspector
function addButtonFromPropertyInspector(context, actionGroup) {
    try {

        imgToBase64(context, actionGroup)
        /// Set Button title to stored Value
        $SD.setTitle(context, actionGroup, 0);

        addButton(context, actionGroup);
        updateButtonState(buttons[buttons.length - 1]); /// Update the state immediately
    } catch (error) {
        console.error('Error adding button from Property Inspector:', error);
    }
}








/// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}







myAction.onKeyUp(({ context, payload }) => {
    console.log('Key up event received');
    console.log(payload.settings.action);

    addButtonFromPropertyInspector(context, payload.settings.action)

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
			console.log("Status:", data.Data.Status)

            /// set button state to match response
            const newState = data.Data.Status === 'True' ? 1 : 0;

            /// Use arrow function to maintain context
            $SD.setState(context, newState);
        })
        .catch(error => {
            console.error('Error sending POST request:', error);
        });
    } catch (error) {
        console.error('Error constructing JSON:', error);
    }
});

myAction.onDidReceiveSettings(({context, payload}) => {
	console.log('Received settings from Property Inspector:', payload);
	console.log(context)
	
    const storedValue = payload.settings.action || 'None';
    console.log('Stored Value:', storedValue);
	addButtonFromPropertyInspector(context, storedValue);


})

myAction.onDialRotate(({ action, context, device, event, payload }) => {
	console.log('Your dial code goes here!');
});

myAction.onSendToPlugin(({ ActionGroup }) => {
	console.log('Action Group Selection received');
});


