document.addEventListener("DOMContentLoaded", function () {
  const readerNameElement = document.getElementById("reader-name");
  const surahNameElement = document.getElementById("surah-name");
  const quranTextElement = document.getElementById("quran-text");
  const audioPlayer = document.getElementById("audio-player");
  const playAudioButton = document.getElementById("play-audio");
  const surahSelect = document.getElementById("surah-select");
  const textSizeSlider = document.getElementById("text-size");
  const recitationSelect = document.getElementById("recitation-select"); // Dropdown for recitation style
  const errorMessage = document.getElementById("error-message"); // Element to display error message

  // Mapping for reader names in Arabic
  const readerNames = {
    abu_bakr_shatri: "أبو بكر الشاطري",
    abdul_baset: "عبدالباسط عبدالصمد",
    abdurrahmaan_as_sudais: "عبدالرحمن السديس",
    // Add more readers here with their Arabic names
  };

  // Get the reader from the URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const reader = urlParams.get("reader");

  if (reader && readerNames[reader]) {
    // Display reader name in Arabic
    readerNameElement.textContent = `القارئ: ${readerNames[reader]}`;
    loadQuranData(reader, 1, "murattal"); // Default Surah 1 (Al-Fatiha) and Murattal recitation
  }

  // Function to load Quran data
  // Function to load Quran data
// Function to load Quran data
function loadQuranData(reader, surahId, recitationStyle) {
    const quranTextAPI = `https://api.alquran.cloud/v1/surah/${surahId}`;
    const surahMetaAPI = `https://api.alquran.cloud/v1/meta`; // API for metadata
  
    // Fetch Quran text
    fetch(quranTextAPI)
      .then((response) => response.json())
      .then((data) => {
        const surah = data.data;
  
        surahNameElement.textContent = surah.name;
  
        // Update this part to include a circle with the ayah number
        quranTextElement.innerHTML = surah.ayahs
          .map((ayah) => `${ayah.text} <span class="circle-number">${ayah.numberInSurah}</span>`)
          .join(" "); // Join all ayahs with a space
  
        // Set the audio URL based on reader, surah, and recitation style
        const audioUrl = `https://download.quranicaudio.com/qdc/${reader}/${recitationStyle}/${surahId}.mp3`;
  
        // Check if the audio URL exists
        fetch(audioUrl, { method: "HEAD" })
          .then((response) => {
            if (response.ok) {
              audioPlayer.src = audioUrl;
              errorMessage.textContent = ""; // Clear any previous error message
            } else {
              if (recitationStyle === "mujawwad") {
                errorMessage.textContent =
                  "التلاوة المجودة غير متوفرة لهذا القارئ ";
              }
              audioPlayer.src = ""; // Clear audio if not available
            }
          })
          .catch((error) => {
            console.log("Error checking audio URL:", error);
            errorMessage.textContent = "حدث خطأ أثناء تحميل الصوت.";
            audioPlayer.src = ""; // Clear audio if error
          });
      })
      .catch((error) => console.log("Error fetching Quran data:", error));
  
    // Populate surah options
    fetch(surahMetaAPI)
      .then((response) => response.json())
      .then((data) => {
        const surahs = data.data.surahs;
        surahs.forEach((surah) => {
          const option = document.createElement("option");
          option.value = surah.number;
          option.textContent = surah.name;
          surahSelect.appendChild(option);
        });
      })
      .catch((error) => console.log("Error fetching surah list:", error));
  }
  // Update Surah when selected
  surahSelect.addEventListener("change", function () {
    const selectedSurah = surahSelect.value;
    const selectedRecitation = recitationSelect.value; // Get selected recitation style
    loadQuranData(reader, selectedSurah, selectedRecitation);
  });

  // Update Recitation style when selected
  recitationSelect.addEventListener("change", function () {
    const selectedRecitation = recitationSelect.value;
    const selectedSurah = surahSelect.value;
    loadQuranData(reader, selectedSurah, selectedRecitation);
  });

  // Adjust text size
  textSizeSlider.addEventListener("input", function () {
    quranTextElement.style.fontSize = textSizeSlider.value + "px";
  });

  playAudioButton.addEventListener("click", function () {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playAudioButton.textContent = "إيقاف الصوت"; // Change button text to "Stop Audio"
      playAudioButton.style.background = "red";
    } else {
      audioPlayer.pause();
      playAudioButton.textContent = "تشغيل الصوت"; // Change button text to "Play Audio"
      playAudioButton.style.background = "#4CAF50";
    }
  });
});
