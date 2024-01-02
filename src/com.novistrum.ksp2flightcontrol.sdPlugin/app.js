/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />


const ActionGroupToggle = new Action('com.novistrum.ksp2flightcontrol.action');

const buttons = [];

const images = {
    "ActionGroup": {
        "True": {
            "Blank": "Buttons/ActionGroup/True/Blank.jpg",
            "Abort": "Buttons/ActionGroup/True/Abort.png",
            "SolarPanels": "Buttons/ActionGroup/True/SolarPanels.png",
            "Lights": "Buttons/ActionGroup/True/Lights.png",
            "Gear": "Buttons/ActionGroup/True/Gear.png",
            "Brakes": "Buttons/ActionGroup/True/Brakes.png", /// May need fixing in the future
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
            "Blank": "Buttons/ActionGroup/False/Blank.jpg",
            "Abort": "Buttons/ActionGroup/False/Abort.png",
            "SolarPanels": "Buttons/ActionGroup/False/SolarPanels.png",
            "Lights": "Buttons/ActionGroup/False/Lights.png",
            "Gear": "Buttons/ActionGroup/False/Gear.png",
            "Brakes": "Buttons/ActionGroup/False/Brakes.png", /// May need fixing in the future
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
    
    // try {
    //     const requestBody = {
    //         "ID": generateRandomString(6),
    //         "Action": "getShiptelemetry",
    //         "parameters": {
                
    //         }
    //     };

    //     fetch('http://127.0.0.1:8080/api', {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify(requestBody)
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         /// Handle the response data as needed
	// 		console.log("Data Returned: ", data);

    //     })
    //     .catch(error => {
    //         console.error('Error sending POST request:', error);
    //     });
    // } catch (error) {
    //     console.error('Error constructing JSON:', error);
    // }

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
        callback(null, dataURL);
    };
    img.onerror = function (error) {
        callback(error, null);
    };
    img.src = url;
}

function imgToBG(context, type, name, status) {
    var imageUrl = "";

    // Check if status is defined and not falsy
    if (status) {
        imageUrl = images[type] && images[type][status] && images[type][status][name];
    } else {
        imageUrl = images[type] && images[type][name];
    }

    if (imageUrl) {
        imgToBase64(imageUrl, (error, base64Img) => {
            if (error) {
                 console.error('Error loading image:', error);
            } else {
                // console.log("Updating image on Context:", context);
                $SD.setImage(context, base64Img);
            }
        });
    } else {
        console.error(`Image URL not found for type: ${type}, name: ${name}, status: ${status}`);

        // Set a placeholder or default image if imageUrl is not found
        // For example, you can set a blank image
        imgToBase64(images["ActionGroup"]["False"]["Blank"], (error, base64Img) => {
            if (!error) {
                $SD.setImage(context, base64Img);
            } else {
                console.error('Error loading default image:', error);
            }
        });
    }
}


/// Function to handle adding a new button to the buttons array
function addButton(context, name) {
    const type = checkType(name);
    // Check if a button with the same context already exists
    const existingButton = buttons.find(button => button.context === context);
    
    if (!existingButton) {
        // If no match is found, add the new button
        buttons.push({ context, type, name, lastState:null});
        // console.log("Button added:", { context, type, name });

    } else {
        // If a match is found, log a message (you can customize this behavior)
        console.log("Button with context already exists:", context);
    }

};

/// Function to make the API request to get the action group state
function getActionGroupState(button) {
    const randomUser = generateRandomString(6);

    const requestBody = {
        "ID": randomUser,
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
        // console.log(button.name, " POST Returned State:", data.Data.Status);
        return data.Data.Status;
    
    })
    .catch(error => {
        console.error('Error getting action group state:', error);
        return null;
    });
};


// Function to update the state of a single button
async function updateSingleButtonState(context) {
    const button = buttons.find(b => b.context === context);
    if (!button) {
        console.error('Button not found for context:', context);
        return;
    }

    try {
        const status = await getActionGroupState(button);
        if (status != null) {
            imgToBG(button.context, button.type, button.name, status);
        }

        
    } catch (error) {
        console.error('Error updating button state:', error);
    }
}


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
			console.log(payload.settings.action, " status on Key Up:", data.Data.Status);
            console.log(payload.settings.action," Button Context: ", context)

            var status = data.Data.Status
            updateSingleButtonState(context, status);
            

        })
        .catch(error => {
            console.error('Error sending POST request:', error);
        });
    } catch (error) {
        console.error('Error constructing JSON:', error);
    }
});

ActionGroupToggle.onDidReceiveSettings(({context, payload}) => {
    var contextName = payload.settings.action

    if (contextName) {
        console.log('Received settings from Property Inspector:', payload);

        addButton(context, contextName);

        console.log(contextName, 'Added');
        
        buttons.forEach((button) => {
            if (context === button.context) {
                var index = buttons.findIndex((button) => button.context === context);
                button.name = contextName;
                button.type = checkType(contextName);
                
                
            }
        });
    } else {
        console.log("Stopping Process till Action Group Selected")
    }

    updateSingleButtonState(context)
});

ActionGroupToggle.onDialRotate(({ action, context, device, event, payload }) => {
	console.log('Your dial code goes here!');
});

ActionGroupToggle.onSendToPlugin(({ ActionGroup }) => {
	console.log('Action Group Selection received');
});


let updateInterval;

function startUpdateInterval() {
    updateInterval = setInterval(() => {
        buttons.forEach(button => {
            const status = getActionGroupState(button);
            updateSingleButtonState(button.context, status);
        });
    }, 2000); // Run every 1000 milliseconds (1 second)
}

function stopUpdateInterval() {
    clearInterval(updateInterval);
}


ActionGroupToggle.onWillAppear(({ context }) => {
    $SD.getSettings(context);    
    startUpdateInterval();
});


ActionGroupToggle.onWillDisappear(({ context }) => {
    stopUpdateInterval();
    const indexToRemove = buttons.findIndex(button => button.context === context);
    
    if (indexToRemove !== -1) {
        buttons.splice(indexToRemove, 1);
    }

    console.log(buttons);
});