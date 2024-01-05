/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />


const ActionGroupToggle = new Action('com.novistrum.ksp2flightcontrol.action');
const ThrustDial = new Action("com.novistrum.ksp2flightcontrol.thrust")

let updateInterval;

let isFetching = false;
let thrustOveride = false
let ServerDown = false;

const buttons = [];

$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
});

// apiInputs arg should be array: [String,Dictionary]: ["Action",{"ParmeterKey":"ParameterValue"}]
function callAPI(apiInputs) {
    return new Promise((resolve, reject) => {
        isFetching = true;
        try {
            const requestBody = {
                "ID": generateRandomString(6),
                "Action": apiInputs[0],
                "parameters": apiInputs[1]
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
                if (apiInputs[0].includes("get")) {
                    if (apiInputs[0] === "getActionGroupState") {
                        let status = data.Data.Status;
                        resolve(status);
                    } 
                    if (apiInputs[0] === "getShipThrottle") {
                        let status = data.Data.Throttle;
                        resolve(status);
                    }

                } else {
                    resolve(null)
                }
                
            })
            .catch(error => {
                console.error('Error sending Test POST request:', error);
                reject(null);
            })
            .finally(() => {
                isFetching = false;
            });
        } catch (error) {
            console.error('Error constructing Test JSON:', error);
            reject(null);
        }
    });
}


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
    var imageUrl = null;
    if (type === "ActionGroup") {
        imageUrl = "Buttons/ActionGroup/"+status+"/"+name+".png"
    } 
    if (type === "Other") {
        imageUrl = "Buttons/Other/"+name+".png"
    }
    if (imageUrl) {
        imgToBase64(imageUrl, (error, base64Img) => {
            if (error) {
                 console.error('Error loading image:', error);
            } else {
                $SD.setImage(context, base64Img);
            }
        });
    } else {
        console.error(`Image URL not found for type: ${type}, name: ${name}, status: ${status}`);
        // Set a placeholder or default image if imageUrl is not found
        imgToBase64("Buttons/Other/BlankToggleOff.png", (error, base64Img) => {
            if (!error) {
                $SD.setImage(context, base64Img);
            } else {
                console.error('Error loading default image:', error);
            }
        });
    }
}


// ACTION GROUP TOGGLES

/// Function to handle adding a new button to the buttons array
async function addButton(context, name, type) {
    // Check if a button with the same context already exists
    const existingButton = buttons.find(button => button.context === context);
    if (!existingButton) {
        if (type === "ActionGroup") {
            const newStatus = await callAPI(["getActionGroupState", { "ID": name }]);
            console.log("Status returned:", newStatus);
            buttons.push({ context, type, name, newStatus});
        }
        if (type === "Other") {
            if (name === "Thrust" && !thrustOveride) {
                const newStatus = await callAPI(["getShipThrottle", {}]);
                console.log("Status returned:", newStatus);
                buttons.push({ context, type, name, newStatus});
            }
            
        }
            
    } else {
        //console.log("Button with context already exists:", context);
    }
    console.log(buttons)
};

function getButton(context) {
    let button = buttons.findIndex(button => button.context === context);

    return button
}


function removeButton(context) {
    const indexToRemove = buttons.findIndex(button => button.context === context);
    if (indexToRemove !== -1) {
        buttons.splice(indexToRemove, 1);
    }
    console.log(buttons);
}

ActionGroupToggle.onKeyUp(({ context, payload }) => {
    let actionName = payload.settings.action
    console.log('Key up event received for', actionName);
    try {
        const requestBody = {
            "ID": generateRandomString(6),
            "Action": "setActionGroupState",
            "parameters": {
                "ID": actionName
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
			console.log(actionName, " In-Game status:", data.Data.Status);
            buttons.forEach((button) => {
                if (context === button.context) {
                    button.status = data.Data.Status;
                    imgToBG(context, button.type, button.name, button.status)
                }
            });
        })
        .catch(error => {
            console.error('Error sending POST request:', error);
        });
    } catch (error) {
        console.error('Error constructing JSON:', error);
    }
});

ActionGroupToggle.onDidReceiveSettings(({context, payload}) => {
    const contextName = payload.settings.action
    const contextType = payload.settings.type
    if (contextName) {
        console.log('Received settings from Property Inspector:', payload);
        addButton(context, contextName, contextType);
        console.log(contextName, 'Added');
        buttons.forEach((button) => {
            if (context === button.context) {
                button.name = contextName;
                button.type = contextType;                
            }
        });
    } else {
        console.log("Stopping Process till Action Group Selected")
    }
});

function startUpdateInterval() {
    updateInterval = setInterval(() => {
        if (!isFetching && !thrustOveride) {
            updateButtonStates();

        };
    }, 500);
}

function stopUpdateInterval() {
    clearInterval(updateInterval);
}

async function updateButtonStates() {
    const promises = buttons.map(async (button) => {
        try {
            let newStatus = null;

            if (button.type === "ActionGroup") {
                newStatus = await callAPI(["getActionGroupState", { "ID": button.name }]);
                imgToBG(button.context, button.type, button.name, newStatus);
            } else if (button.type === "Other" && button.name === "Thrust") {
                newStatus = await callAPI(["getShipThrottle", {}]);
                thrust = Math.round(Number(newStatus.toFixed(2)) * 100);
                // Update the layout
                let payload = {
                        "value": thrust,
                        "indicator": { "value": thrust}
                    };
                $SD.setFeedback(button.context, payload)
            }
            if (newStatus !== null && button.lastState !== newStatus) {
                button.lastState = newStatus;
            } else if (newStatus === null) {
                console.error("Error on status get:", newStatus);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    await Promise.all(promises);
}


ActionGroupToggle.onWillAppear(({ context }) => {
    $SD.getSettings(context);        
    startUpdateInterval();
});


ActionGroupToggle.onWillDisappear(({ context }) => {
    stopUpdateInterval();
    removeButton(context)
});





/// THRUST DIAL
ThrustDial.onWillAppear(({context}) => {
    $SD.getSettings(context)
    addButton(context, "Thrust", "Other")
    startUpdateInterval();

    let payload = {
        "title": {"value": "Thrust","alignment": "Center", "font": {"size": 30},"zOrder":3},
        "value": {"alignment": "Center", "font": {"size": 30},"zOrder":2},
        "icon": {"value":"Buttons/TouchBar/ThrustIcon.svg", "rect":[0,0,200,100], "zOrder":0,},
        "indicator": { "rect": [25,65,150,40], "bar_bg_c":"0:#ff0000,0.4:#00ff00,1:#00ff00", "zOrder":1}
    };
    $SD.setFeedback(context, payload)

});

ThrustDial.onWillDisappear(({context}) => {
    stopUpdateInterval();
    removeButton(context)
})

ThrustDial.onDialPress(({action,context,device,event,payload}) => {
    if (!payload.pressed) {
        console.log("Dial press released")
        updateThrust(0.0)
    }
});

ThrustDial.onTouchTap(({action,context,device,event,payload}) => {
    if (!payload.pressed) {
        console.log("Touch Tap")
        updateThrust(1.0)
    }
});

const rotationThreshold = 0.1; // Adjust this threshold to control the speed sensitivity
let rotationTimer;
let lastRotationTime = Date.now(); // Initialize with the current time

ThrustDial.onDialRotate(({ action, context, device, event, payload }) => {
    if (!payload.pressed) {
        clearTimeout(rotationTimer);

        let thrust = null;
        for (const button of buttons) {
            if (context === button.context && button.name === "Thrust") {
                thrustButton = button;
                thrust = button.lastState;

                const rotationTicks = parseInt(payload.ticks, 10);

                // Calculate time since the last rotation event
                const currentTime = Date.now();
                const timeDelta = currentTime - lastRotationTime;
                lastRotationTime = currentTime;

                // Calculate rotation speed based on timeDelta
                const rotationSpeed = timeDelta > 0 ? Math.abs(rotationTicks / timeDelta) * 3 : 0;
                console.log("Rotation Ticks", rotationTicks);
                console.log("Time Delta: ", timeDelta);
                console.log("Rotation Speed: ", rotationSpeed);
                console.log("Rotation Threshold: ", rotationThreshold);

                if (rotationSpeed > rotationThreshold) {
                    // Fast rotation
                    thrust += rotationTicks > 0 ? 0.05 : -0.05;
                    console.log("Rotated fast");
                } else {
                    // Slow rotation
                    thrust += rotationTicks > 0 ? 0.01 : -0.01;
                    console.log("Rotated slow");
                }

                thrust = Math.min(1.0, Math.max(0.0, thrust)); // Ensure thrust stays in [0.0, 1.0]
                thrust = Number(thrust.toFixed(2));

                button.lastState = thrust;
                updateThrust(thrust);
            }
        }

        rotationTimer = setTimeout(() => {
            // Handle the end of rotation (user has stopped turning the dial)
            console.log("Dial rotation stopped");
        }, 250); // Adjust the delay as needed
    }
});



async function updateThrust(newThrust) {
    thrustOveride = true;
    console.log("New Thrust:", newThrust);
    await callAPI(["setShipThrottle", { "Throttle": newThrust }]);
    thrustOveride = false
}


