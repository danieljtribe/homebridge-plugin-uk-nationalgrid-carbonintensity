# UK National Grid Carbon Intensity Plugin

Presents a Carbon Dioxide sensor within HomeKit to reflect the current carbon dioxide output of the UK National Grid's current carbon output (https://carbonintensity.org.uk).

## Example config.json

    {
        "bridge": {
            "name": "House",
            "username": "CC:12:34:56:12:34",
            "port": 51826,
            "pin": "031-45-157"
        },

        "description": "",

        "accessories": [
            {
                "accessory": "National Grid Carbon Intensity",
                "name": "National Grid Carbon Intensity",
                "highCarbonLevels": ["high", "veryhigh"]
            }
        ],

        "platforms": [
        ]
    }

Possible values of `highCarbonLevels` are: "low", "moderate", "high" and "veryhigh".