async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/")

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allAnchorTags = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < allAnchorTags.length; i++) {
        const element = allAnchorTags[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    // console.log(songs);
    return songs;
}

getSongs()

async function getSongNames() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let allNameSpans = div.querySelectorAll(".name");
    let songNames = [];
    for (let i = 0; i < allNameSpans.length; i++) {
        const element = allNameSpans[i];
        if (element.innerHTML.endsWith(".mp3")) {
            songNames.push(element.innerHTML.replace(" 128 Kbps.mp3", ""))
        }
    }

    return songNames;
}


// async function playAudio() {
//     // Get list of songs
//     let songs = await getSongs();
//     console.log(songs)
//     // Play the first song
//     var audio = new Audio(songs[2]);
//     audio.play();
//     audio.addEventListener("loadeddata", () => {
//         console.log(audio.duration, audio.currentSrc, audio.currentTime)
//     })
// }
// playAudio();



let currentSong = new Audio()
let play = document.querySelector(".playBarPlay")
let pause = document.querySelector(".playBarPause")
let play2;
let pause2;
let playNowText;
let previousSong;
let currentIndex;

let numberOfSongs = 0;
songDetails = [];


const timeString = (time)=>{
    let totalSeconds = Math.floor(time);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}




// Show all the songs in the library section and add a click event listener to each song:
async function listSongsToLibrary() {
    // let songsURL = await getSongs();
    // console.log(songsURL)
    let songNames = await getSongNames();
    let songListUl = document.querySelector(".song-list ul") 

    // console.log("songNames = ", songNames);

    numberOfSongs = songNames.length;

    console.log("songDetails = ", songDetails);

    for (const song of songNames) {
        let songSplit = song.split(" - ");
        songListUl.innerHTML += `<li class="library-music-card">
                            <img src="assets/music-icon.svg" alt="music icon" class="invert music-icon">
                            <div class="info">
                                <h3>${songSplit[0]}</h3>
                                <p>${songSplit[1]}</p>  
                            </div>
                            <div class="play-now flex items-center justify-center">
                                <p>Play Now</p>
                                <img class="invert play-song" src="assets/play.svg" alt="play">
                                <img class="pause-song" src="assets/pause.svg" alt="pause">
                            </div>  
                        </li>`;
    }


    // making an array of song details : name, artist, url
    let allListItems = document.querySelectorAll(".song-list ul li");
    for(let i=0;i<songNames.length;i++){
        let songSplit = songNames[i].split(" - ");
        let songName = songSplit[0];
        let artistName = songSplit[1];
        let url = songNames[i] + " 128 Kbps.mp3";
        let list = document.querySelector(".song-list ul").firstElementChild;
        songDetails.push({
            name: songName,
            artist: artistName,
            url: `http://127.0.0.1:5500/songs/${url}`,
            list: allListItems[i]
        });
    }

    // if (!currentSong.src || (currentSong.paused && currentSong.currentTime === 0)) {
    //     currentSong.src = songDetails[0].url;
    //     document.querySelector(".song-info").innerHTML = `<h3>${songDetails[0].name}</h3>
    //             <p>${songDetails[0].artist}</p> `
    //     // playSong(allListItems[0], 0);
    // }

    // Attach an event listener to each song in the library
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((ele,index) => {
        ele.addEventListener("click", () => {
            // here ele is li element of song-card in library section
            console.log(index)
            playSong(ele, index);
        })
    })
    seekbarUpdate();
}




function playSong(ele, index) {

    currentIndex = index;
    ele.style.backgroundColor = "rgb(101, 61, 61)";
    // If any song playing already, then set it's buttons to normal when new song played
    if (previousSong && previousSong != ele) {
        previousSong.getElementsByClassName("play-song")[0].style.display = "block"
        previousSong.getElementsByClassName("pause-song")[0].style.display = "none"
        previousSong.querySelector(".play-now p").innerHTML = "Play Now";
        previousSong.style.backgroundColor = "#121212";
    }

    play2 = ele.getElementsByClassName("play-song")[0]
    pause2 = ele.getElementsByClassName("pause-song")[0]
    playNowText = ele.querySelector(".play-now p")

    let songName = songDetails[index].name;
    let artistName = songDetails[index].artist;
    let url = songDetails[index].url;

    currentSong.src = url;
    currentSong.play();

    currentSong.addEventListener("loadeddata", () => {
        console.log(currentSong.duration)
        document.querySelector(".total-duration").innerHTML = `${timeString(currentSong.duration)}`;
    })

    play.style.display = "none";
    pause.style.display = "block";
    play2.style.display = "none";
    pause2.style.display = "block";
    playNowText.innerHTML = "Playing..."

    let songInfo = document.querySelector(".song-info")
    songInfo.innerHTML = `<h3>${songName}</h3>
                <p>${artistName}</p> `

    previousSong = ele;
}

listSongsToLibrary();





function seekbarUpdate() {
    let workingSeekbar = document.querySelector(".working-seekbar");
    let seekbarCircle = document.querySelector(".circle");
    let seekbarFill = document.querySelector(".seekbar-fill");

    // Update color of seekbar and move circle as song plays
    setInterval(() => {
        let percentage = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
        seekbarCircle.style.left = percentage;
        seekbarFill.style.width = percentage;
        document.querySelector(".current-time").innerHTML = `${timeString(currentSong.currentTime)}`
    }, 500)

    // Add and event listener to seekbar
    workingSeekbar.addEventListener("click", (e)=>{
        console.log(e.offsetX, workingSeekbar.offsetWidth);
        let percentage = (e.offsetX / workingSeekbar.offsetWidth)*100;
        console.log(percentage);
        seekbarCircle.style.left = `${percentage}%`;
        seekbarFill.style.width = `${percentage}%`;
        currentSong.currentTime = (currentSong.duration * (percentage / 100));
        document.querySelector(".current-time").innerHTML = `${timeString(currentSong.currentTime)}`
    })
}


// agar play button pe click kiya, toh song play hoga, and pause button visible hoga
function handlePlay(){
    currentSong.play()
    pause.style.display = "block"
    play.style.display = "none"
    pause2.style.display = "block"
    play2.style.display = "none"
    playNowText.innerHTML = "Playing..."
}

// agar pause button pe click kiya, toh song pause hoga, and play button visible hoga
function handlePause(){
    currentSong.pause()
    pause.style.display = "none"
    play.style.display = "block"
    pause2.style.display = "none"
    play2.style.display = "block"
    playNowText.innerHTML = "Play Now"
}

play.addEventListener("click",handlePlay);
pause.addEventListener("click", handlePause);

document.addEventListener("keydown", (e) => {
    if(e.code ==="Space" && !currentSong.src){
        alert("Please select a song to play first!");
        return;
    }
    if (e.code === "Space") {
        e.preventDefault();
        if (currentSong.paused) {
            handlePlay();
        } else {
            handlePause();
        }
    }

});


function handleNextPrevious(){
    let next = document.querySelector(".next-song")
    let previous = document.querySelector(".previous-song")
    next.addEventListener("click", ()=>{
        console.log("songDetails[(currentIndex+1)%numberOfSongs].list = ", songDetails[(currentIndex+1)%numberOfSongs].list);
        console.log((currentIndex+1)%numberOfSongs);
        playSong(songDetails[(currentIndex+1)%numberOfSongs].list, (currentIndex+1)%numberOfSongs)
    })

    previous.addEventListener("click", ()=>{
        playSong(songDetails[(currentIndex-1+numberOfSongs)%numberOfSongs].list, (currentIndex-1)%numberOfSongs)
    })
}

handleNextPrevious();