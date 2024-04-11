(async () => {
    await WebMidi.enable(); // Imports the WebMidi library

    // Initialize variables to store the first MIDI input and output devices detected.
    // These devices can be used to send or receive MIDI messages.
    let myInput = WebMidi.inputs[0];
    let myOutput = WebMidi.outputs[0].channels[1];

    // Get the dropdown elements from the HTML document by their IDs.
    let dropIns = document.getElementById("dropdown-ins");
    let dropOuts = document.getElementById("dropdown-outs");
    let dropKey = document.getElementById("key");

    // Function to populate dropdowns with MIDI input and output devices
    const populateDropdowns = () => {
        // Clear existing options
        dropIns.innerHTML = '';
        dropOuts.innerHTML = '';
        
        // Populate dropdown for MIDI inputs
        WebMidi.inputs.forEach(function (input, num) {
            dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
        });

        // Populate dropdown for MIDI outputs
        WebMidi.outputs.forEach(function (output, num) {
            dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
        });
    };

    // Initial population of dropdowns
    populateDropdowns();

    // Add event listeners for the dropdowns to update MIDI input and output devices.
    dropIns.addEventListener("change", function () {
        if (myInput.hasListener("noteon")) {
            myInput.removeListener("noteon");
        }
        if (myInput.hasListener("noteoff")) {
            myInput.removeListener("noteoff");
        }
        myInput = WebMidi.inputs[dropIns.value];
    });

    dropOuts.addEventListener("change", function () {
        myOutput = WebMidi.outputs[dropOuts.value].channels[1];
    });

    // Function to play jazz chord
    const playJazzChord = function (scaleTone, key) {
        const jazzChords = {
            1: [0, 4, 7, 11],
            2: [0, 3, 7, 11],
            3: [0, 3, 7, 11],
            4: [0, 4, 7, 11],
            5: [0, 4, 7, 10],
            6: [0, 3, 7, 11],
            7: [0, 3, 6, 9]
        };

        const keyOffsets = {
            "C": 0,
            "Db": 1,
            "D": 2,
            "Eb": 3,
            "E": 4,
            "F": 5,
            "Gb": 6,
            "G": 7,
            "Ab": 8,
            "A": 9,
            "Bb": 10,
            "B": 11
        };

        const chord = jazzChords[scaleTone];
        const keyOffset = keyOffsets[key];

        if (!chord) {
            console.error("Invalid chord for scale tone:", scaleTone);
            return; // Exit the function if the chord is undefined
        }

        console.log("Playing chord:", chord);

        // Send MIDI data to Logic Pro
        chord.forEach(note => {
            myOutput.playNote({
                number: note + keyOffset,
                velocity: 100, // Adjust velocity as needed
                channel: 1 // MIDI channel
            });
        });
    };

    myInput.addListener("noteon", function (someMIDI) {
        const scaleTone = ((someMIDI.note.number % 12) % 7) + 1;
        const selectedKey = dropKey.value; // Get the selected key from the dropdown
        playJazzChord(scaleTone, selectedKey);
    });
    
    myInput.addListener("noteoff", function (someMIDI) {
        const scaleTone = ((someMIDI.note.number % 12) % 7) + 1;
        const selectedKey = dropKey.value; // Make sure to do the same for noteoff
        playJazzChord(scaleTone, selectedKey);
    });
})();