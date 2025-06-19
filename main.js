document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});


let songDetails = [];
let allHref = [];

// let defaultFolder = 'disco'; // Default folder to load songs from
let previousFolder="disco";
let currentFolder;

async function getSongs(folder) {
    songDetails=[];
    allHref=[];
    let a = await fetch(`http://127.0.0.1:5500/library/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let ul = div.querySelector("ul");

    let allAnchorTags = ul.getElementsByTagName("a");

    for (let i = 0; i < allAnchorTags.length; i++) {
        const element = allAnchorTags[i];
        if (element.href.endsWith(".mp3")) {
            allHref.push(element.href);
        }
    }
    console.log(allHref);
    previousFolder = currentFolder;
}



async function getMetaData(folder) {
    currentFolder = folder;
    // localStorage.removeItem(`cachedSongDetails${folder}`)

    const cached = localStorage.getItem(`cachedSongDetails${folder}`);

    if (cached) {
        console.log("Loading songs from localStorage...");
        songDetails = JSON.parse(cached);
        listSongsToLibrary();

        // Now fetch images in background
        for (let i = 0; i < songDetails.length; i++) {
            fetch(songDetails[i].url)
                .then(res => res.blob())
                .then(blob => {
                    jsmediatags.read(blob, {
                        onSuccess: function (tag) {
                            const pic = tag.tags.picture;
                            if (pic) {
                                const byteArray = new Uint8Array(pic.data);
                                const blobImage = new Blob([byteArray], { type: pic.format });
                                const reader = new FileReader();
                                reader.onloadend = function () {
                                    // Update image in UI only
                                    songDetails[i].pictureSrc = reader.result;
                                    if(i==0){
                                        document.querySelector(`[data-name=${folder}]`).getElementsByTagName("img")[0].src = reader.result; 
                                        document.querySelector(`[data-name=${folder}]`).getElementsByTagName("img")[0].classList.remove("invert");
                                    }
                                    const imgTag = songDetails[i].list.querySelector("img.music-icon");
                                    imgTag.src = reader.result;
                                    imgTag.classList.remove("invert");
                                };
                                reader.readAsDataURL(blobImage);
                            }
                        }
                    });
                });
        }

        return;
    }


    // Fetch and parse normally if not cached
    await getSongs(folder);
    if (allHref.length === 0) return;

    for (const fileUrl of allHref) {
        await new Promise((resolve) => {
            fetch(fileUrl)
                .then(response => response.blob())
                .then(blob => {
                    jsmediatags.read(blob, {
                        onSuccess: function (tag) {
                            songDetails.push({
                                name: tag.tags.title || "Unknown Title",
                                artist: tag.tags.artist || "Unknown Artist",
                                album: tag.tags.album || "Unknown Album",
                                pictureSrc: null, // no image for now
                                url: fileUrl
                            });
                            resolve();
                        },
                        onError: function () {
                            songDetails.push({
                                name: "Unknown Title",
                                artist: "Unknown Artist",
                                album: "Unknown Album",
                                pictureSrc: null,
                                url: fileUrl
                            });
                            resolve();
                        }
                    });
                });
        });
    }

    // Store only essential info
    const minimalData = songDetails.map(({ name, artist, album, url }) => ({
        name, artist, album, url
    }));

    localStorage.setItem(`cachedSongDetails${folder}`, JSON.stringify(minimalData));
    listSongsToLibrary();

    // Start background image loading
    getMetaData(folder); // re-run to trigger cache image population
}


let currentSong = new Audio();
let play = document.querySelector(".playBarPlay");
let pause = document.querySelector(".playBarPause");
let play2;
let pause2;
let playNowText;
let previousSong;
let currentIndex;

const timeString = (time) => {
    let totalSeconds = Math.floor(time);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

function listSongsToLibrary() {
    let songListUl = document.querySelector(".song-list ul");
    songListUl.innerHTML = ""; // Clear existing songs

    for (let i = 0; i < songDetails.length; i++) {
        const song = songDetails[i];
        const imageTag = song.pictureSrc
            ? `<img src="${song.pictureSrc}" alt="music icon" class="music-icon">`
            : `<img src="assets/music-icon.svg" alt="music icon" class="invert music-icon">`;

        songListUl.innerHTML += `<li class="library-music-card">
            ${imageTag}
            <div class="info">
                <h3>${(song.name).replace(/\(.*?\)/g, "").trim().split("::")[0]}</h3>
                <p>${song.album.replace(/\(.*?\)/g, "").trim()}</p>  
            </div>
            <div class="play-now flex items-center justify-center">
                <p>Play Now</p>
                <img class="invert play-song" src="assets/play.svg" alt="play">
                <img class="pause-song" src="assets/pause.svg" alt="pause">
            </div>  
        </li>`;
    }

    let allListItems = document.querySelectorAll(".song-list ul li");
    for (let i = 0; i < songDetails.length; i++) {
        songDetails[i].list = allListItems[i];
    }

    Array.from(allListItems).forEach((ele, index) => {
        ele.addEventListener("click", () => {
            playSong(ele, index);
        });
    });

    seekbarUpdate();
}

function playSong(ele, index) {
    currentIndex = index;
    ele.style.backgroundColor = "rgb(101, 61, 61)";
    if (previousSong && previousSong != ele) {
        previousSong.getElementsByClassName("play-song")[0].style.display = "block";
        previousSong.getElementsByClassName("pause-song")[0].style.display = "none";
        previousSong.querySelector(".play-now p").innerHTML = "Play Now";
        previousSong.style.backgroundColor = "#1d1d1d";
    }

    play2 = ele.getElementsByClassName("play-song")[0];
    pause2 = ele.getElementsByClassName("pause-song")[0];
    playNowText = ele.querySelector(".play-now p");

    currentSong.src = songDetails[index].url;
    currentSong.play();

    currentSong.addEventListener("loadeddata", () => {
        document.querySelector(".total-duration").innerHTML = timeString(currentSong.duration);
    });

    play.style.display = "none";
    pause.style.display = "block";
    play2.style.display = "none";
    pause2.style.display = "block";
    playNowText.innerHTML = "Playing...";

    document.querySelector(".song-info").innerHTML = `
        <h3>${songDetails[index].name.replace(/\(.*?\)/g, "").trim()}</h3>
        <p>${songDetails[index].album.replace(/\(.*?\)/g, "").trim()}</p>`;
    document.querySelector(".song-thumbnail").innerHTML = songDetails[index].pictureSrc
            ? `<img src="${songDetails[index].pictureSrc}" alt="music icon" class="music-icon">`
            : `<img src="assets/music-icon.svg" alt="music icon" class="invert music-icon">`;
    previousSong = ele;
}

function seekbarUpdate() {
    let workingSeekbar = document.querySelector(".working-seekbar");
    let seekbarCircle = document.querySelector(".circle");
    let seekbarFill = document.querySelector(".seekbar-fill");

    setInterval(() => {
        if (!currentSong.duration) return;
        let percentage = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
        seekbarCircle.style.left = percentage;
        seekbarFill.style.width = percentage;
        document.querySelector(".current-time").innerHTML = timeString(currentSong.currentTime);
    }, 500);

    workingSeekbar.addEventListener("click", (e) => {
        e.stopPropagation();
        let percentage = (e.offsetX / workingSeekbar.offsetWidth) * 100;
        seekbarCircle.style.left = `${percentage}%`;
        seekbarFill.style.width = `${percentage}%`;
        currentSong.currentTime = currentSong.duration * (percentage / 100);
        document.querySelector(".current-time").innerHTML = timeString(currentSong.currentTime);
    });
}

function handlePlay() {
    currentSong.play();
    pause.style.display = "block";
    play.style.display = "none";
    pause2.style.display = "block";
    play2.style.display = "none";
    playNowText.innerHTML = "Playing...";
}

function handlePause() {
    currentSong.pause();
    pause.style.display = "none";
    play.style.display = "block";
    pause2.style.display = "none";
    play2.style.display = "block";
    playNowText.innerHTML = "Play Now";
}

play.addEventListener("click", handlePlay);
pause.addEventListener("click", handlePause);

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !currentSong.src) {
        alert("Please select a song to play first!");
        return;
    }
    if (e.code === "Space") {
        e.preventDefault();
        currentSong.paused ? handlePlay() : handlePause();
    }
});

function handleNextPrevious() {
    let next = document.querySelector(".next-song");
    let previous = document.querySelector(".previous-song");

    next.addEventListener("click", (e) => {
        e.stopPropagation();
        let nextIndex = (currentIndex + 1) % songDetails.length;
        playSong(songDetails[nextIndex].list, nextIndex);
    });

    previous.addEventListener("click", (e) => {
        e.stopPropagation();
        let prevIndex = (currentIndex - 1 + songDetails.length) % songDetails.length;
        playSong(songDetails[prevIndex].list, prevIndex);
    });
}

function hamburgerActivity(){
    let ham = document.querySelector(".hamburger img");
    let left = document.querySelector(".left");
    ham.addEventListener("click",(e)=>{
        e.stopPropagation();
        console.log('hamburger clicked');
        left.style.left = "0%";
        // left.style.width = "50%";
        left.classList.add("hamburger-transition")

    })

    let cross = document.querySelector(".cross");
    cross.addEventListener("click",()=>{
        left.style.left = "-100%";
    })

    let right = document.querySelector(".right")
    right.addEventListener("click", ()=>{
        left.style.left = "-100%";
    })

}

hamburgerActivity();
handleNextPrevious();


async function getFolderNames() {
    let a = await fetch("http://127.0.0.1:5500/library/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let folderNames = []
    let ul = div.querySelector("ul");
    if(ul){
        let allAnchor = ul.querySelectorAll("li a");
        for(let i=0; i<allAnchor.length; i++){
            let folderName = allAnchor[i].href.split("library/")[1];
            // console.log(folderName);
            if(folderName!==undefined){
                folderNames.push(folderName);
            }
        }
    }
    return folderNames;
}


async function main() {
    let folderNames = await getFolderNames();
    let cardContainer = document.querySelector(".cardContainer");
    let existingCards = document.querySelectorAll(".card");
    let existingNames = Array.from(existingCards).map(card => card.dataset.name);

    // Dynamically create missing cards
    for (let i = 0; i < folderNames.length; i++) {
        let folderName = folderNames[i];
        if (!existingNames.includes(folderName)) {
            cardContainer.innerHTML += `
                <div class="card" data-name="${folderName}">
                    <div class="imageWrapper"> 
                        <img class="card-img rounded-2 invert" src="assets/music-icon.svg" alt="card image">
                        <div class="play-button">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" class="e-9960-icon e-9960-baseline"
                                viewBox="0 0 24 24">
                                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path>
                            </svg>
                        </div>
                    </div>
                    <h2>${folderName.replace("/"," ").replace("-"," ").replace("%20"," ")}</h2>
                    <p>Description for ${folderName.replace("/"," ").replace("-"," ").replace("%20"," ")}</p>
                    <div class="three-dots-wrapper">
                        <img class="invert three-dots" src="assets/threeDots.svg" alt="more" height="20px">
                    </div>
                    <div class="clearCacheMenu">Clear Cache</div>
                </div>`;
        }
    }

    // Re-select cards after dynamic addition
    let cards = document.querySelectorAll(".card");

    // Preload metadata for all
    for (let card of cards) {
        let folderName = card.dataset.name;
        await getMetaData(folderName);
    }

    // Add event listeners for click
    for (let card of cards) {
        let folderName = card.dataset.name;
        card.addEventListener("click", async () => {
            await getMetaData(folderName);
        });

        // adding event listener to three dots on card
        let threeDots = card.querySelector(".three-dots-wrapper")
        let clearCacheMenu = card.querySelector(".clearCacheMenu")
        threeDots.addEventListener("click",(e)=>{
            e.stopPropagation();
            clearCacheMenu.classList.add("animateClearCacheButton")
            console.log("three dots clicked")
        })

        clearCacheMenu.addEventListener("click",async (e)=>{
            e.stopPropagation();
            localStorage.removeItem(`cachedSongDetails${folderName}`)
            await getMetaData(folderName);
            clearCacheMenu.classList.remove("animateClearCacheButton")
        })

        let right = document.querySelector(".right")
        right.addEventListener("click", ()=>{
            clearCacheMenu.classList.remove("animateClearCacheButton")
        })
    }
currentSong.src = songDetails[0].url;
document.querySelector(".song-info").innerHTML = `
    <h3>${songDetails[0].name.replace(/\(.*?\)/g, "").trim()}</h3>
    <p>${songDetails[0].album.replace(/\(.*?\)/g, "").trim()}</p>`;
document.querySelector(".song-thumbnail").innerHTML = songDetails[0].pictureSrc
        ? `<img src="${songDetails[0].pictureSrc}" alt="music icon" class="music-icon">`
        : `<img src="assets/music-icon.svg" alt="music icon" class="invert music-icon">`;
}


main()
