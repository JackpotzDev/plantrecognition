// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/CjH2h8vm9/";

let model, webcam, resultLabel, maxPredictions;

const wordMap = {
    "trèfle soutterain": "Underground clover",
    "crépide de nimes": "Nimes crepide",
    "séneçon du cap": "Cape senecon",
    "séneçon commun": "Common senecon",
    "rumex a feuilles obtuses": "Rumex with obtuse leaves",
    "paquerette": "Daisy",
    "laurier cerise": "Cherry laurel",
    "lamier pourpre": "Purple dead-nettle",
    "jonquille": "Daffodil",
    "grande oseille": "Sorrel",
    "géranium a feuilles molles": "Geranium with soft leaves",
    "fraises": "Strawberries",
    "crépide tendre": "Tender crepide",
    "chèvreveuille du japon": "Japanese honeysuckle",
    "capselle rougeatre": "Reddish shepherd's-purse",
    "aec-de-grue a feuilles de ciguë": "Crane's-bill with hemlock leaves",
    "ail des vignes": "Vine garlic",
};

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Hide overlay and start button
    document.getElementById("overlay").style.display = 'none';
    document.getElementById("startBtn").style.display = "none";

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(300, 200, flip); // width, height, flip
    await webcam.setup({ facingMode: "environment" }); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    resultLabel = document.getElementById("result");

    // Reveal predict and restart button
    document.querySelectorAll(".appear").forEach(e => {
        e.style.display = 'block'
    });
}

async function loop() {
    webcam.update(); // update the webcam frame
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    webcam.pause()

    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    const highestProbabilityPrediction = prediction.reduce((highest, current) => {
        return current.probability > highest.probability ? current : highest;
    }, prediction[0]);
    
    resultLabel.innerHTML = `Nom de la plante : ${highestProbabilityPrediction.className}<br> Probabilité : ${(highestProbabilityPrediction.probability * 100).toFixed(2)}%`;

    //generateImageTable(highestProbabilityPrediction.className); // Specify the topic here
    //document.querySelectorAll(".appear2").forEach(e => {
        //e.style.display = 'block'
    //});
}

async function restart() {
    webcam.play()
}

async function fetchImages(topic) {
    translatedTopic = wordMap[topic.toLowerCase()];
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${translatedTopic} plant&per_page=16&client_id=R2gELuzY--ILsyt8NXmP3sivjXk8J2r51CbmvC7D6Cg`);
    const data = await response.json();
    return data.results.map(result => result.urls.regular);
}

async function generateImageTable(topic) {
    const images = await fetchImages(topic);
    const table = document.getElementById('imageTable');

    for (let i = 0; i < images.length; i += 2) {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        cell1.innerHTML = `<img src="${images[i]}" alt="Image ${i + 1}" class="image" onclick="showFullscreenImage('${images[i]}')">`;
        cell2.innerHTML = `<img src="${images[i + 1]}" alt="Image ${i + 2}" class="image" onclick="showFullscreenImage('${images[i + 1]}')">`;
    }
}

function showFullscreenImage(imageSrc) {
    document.getElementById('fullscreenImage').src = imageSrc;
    document.getElementById('fullscreenImageContainer').style.display = 'block';
}

function closeFullscreenImage() {
    document.getElementById('fullscreenImageContainer').style.display = 'none';
}