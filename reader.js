document.addEventListener("DOMContentLoaded", function () {

  const readerNameElement = document.getElementById("reader-name");
  const surahNameElement = document.getElementById("surah-name");
  const quranTextElement = document.getElementById("quran-text");
  const audioPlayer = document.getElementById("audio-player");
  const playAudioButton = document.getElementById("play-audio");
  const surahSelect = document.getElementById("surah-select");
  const textSizeSlider = document.getElementById("text-size");
  const recitationSelect = document.getElementById("recitation-type");
  const errorMessage = document.getElementById("error-message");

  
  const readerNames = {
    shatri: { name: "أبو بكر الشاطري", types: [] },
    basit: {
      name: "عبدالباسط عبدالصمد",
      types: [[], "Almusshaf-Al-Mojawwad", "Rewayat-Warsh-A-n-Nafi"],
    },
    sds: { name: "عبدالرحمن السديس", types: [] },
    hani: { name: "هاني الرفاعي", types: [] },
    afs: {
      name: "مشاري راشد العفاسي",
      types: [[], "Rewayat-AlDorai-A-n-Al-Kisa-ai"],
    },
    minsh: {
      name: "محمد صديق المنشاوي",
      types: [[], "Almusshaf-Al-Mo-lim", "Almusshaf-Al-Mojawwad"],
    },
    husr: {
      name: "محمود خليل الحصري",
      types: [
        "Rewayat-Qalon-A-n-Nafi",
        "Rewayat-Aldori-A-n-Abi-Amr",
        "Almusshaf-Al-Mojawwad",
        "Rewayat-Warsh-A-n-Nafi",
        "Murattal",
      ],
    },
    shur:{name:"سعود الشريم",types:[]},
    frs_a:{name:"فارس عباد",types:[]},
    ajm:{name:"أحمد بن علي العجمي",types:[]},
    ahmed_ibn_3ali_al_3ajamy: { name: "أحمد العجمي", types: ["Murattal"] },
    ayyub: { name: "محمد أيوب", types: [] },
  };

  const recitationTypesMap = {
    "Almusshaf-Al-Mojawwad": "المصحف المجود",
    Murattal: "  مرتل",
    "Rewayat-Warsh-A-n-Nafi": "ورش عن نافع - مرتل",
    "Rewayat-Qalon-A-n-Nafi": "قالون عن نافع - مرتل",
    "Rewayat-Aldori-A-n-Abi-Amr": "الدوري عن أبي عمرو - مرتل",
    "Rewayat-AlDorai-A-n-Al-Kisa-ai": "الدوري عن الكسائي - مرتل",
    "Almusshaf-Al-Mo-lim": "المصحف المعلم - المصحف المعلم",
  };

  // Get reader from URL
  const urlParams = new URLSearchParams(window.location.search);
  const reader = urlParams.get("reader");

  if (reader && readerNames[reader]) {
    readerNameElement.textContent = `القارئ: ${readerNames[reader].name}`;
    populateRecitationTypes(reader);
    loadQuranData(reader, 1, recitationSelect.value);
  }

  /**
   * Formats a number to a three-digit string (e.g., 1 -> "001", 10 -> "010", 114 -> "114")
   */
  function formatSurahId(number) {
    return number.toString().padStart(3, "0");
  }

  /**
   * Populate recitation type dropdown based on available types
   */
  function populateRecitationTypes(reader) {
    recitationSelect.innerHTML = ""; // Clear previous options

    if (readerNames[reader]) {
      let types = readerNames[reader].types;

      if (Array.isArray(types[0]) && types[0].length === 0) {
        let option = document.createElement("option");
        option.value = "";
        option.textContent = recitationTypesMap["Murattal"];
        recitationSelect.appendChild(option);
      }
      if (types.length === 0) {
        let option = document.createElement("option");
        option.value = "";
        option.textContent = recitationTypesMap["Murattal"];
        recitationSelect.appendChild(option);
      }

      // Populate the dropdown with available types (excluding the empty array case)
      types.forEach((type) => {
        if (Array.isArray(type) && type.length === 0) return; // Skip empty arrays

        let option = document.createElement("option");
        option.value = type;
        option.textContent = recitationTypesMap[type] || type;
        recitationSelect.appendChild(option);
      });

      recitationSelect.style.display = "block"; // Show dropdown
    } else {
      recitationSelect.style.display = "none"; // Hide select if reader not found
    }
  }

  /**
   * Fetch Quran text and audio
   */
  function loadQuranData(reader, surahId, recitationType) {
    const quranTextAPI = `https://api.alquran.cloud/v1/surah/${surahId}`;

    fetch(quranTextAPI)
      .then((response) => response.json())
      .then((data) => {
        const surah = data.data;
        surahNameElement.textContent = surah.name;
        quranTextElement.innerHTML = surah.ayahs
          .map(
            (ayah) =>
              `${ayah.text} <span class="circle-number">${ayah.numberInSurah}</span>`
          )
          .join(" ");

        // Try fetching the audio from multiple servers (6 to 16)
        tryAudioSources(reader, formatSurahId(surahId), recitationType, 6);
      })
      .catch((error) => console.log("Error fetching Quran data:", error));
  }

  /**
   * Try fetching audio from different servers (server6 to server16)
   */
  function tryAudioSources(reader, surahId, recitationType, serverIndex) {
    if (serverIndex > 16) {
      errorMessage.textContent = "التلاوة غير متوفرة لهذا القارئ";
      audioPlayer.src = "";
      return;
    }

    // Construct audio URL based on whether recitationType exists
    let audioUrl;
    if (recitationType) {
      // If recitationType is provided, include it in the URL
      audioUrl = `https://server${serverIndex}.mp3quran.net/${reader}/${recitationType}/${surahId}.mp3`;
    } else {
      // If no recitationType is provided, use the base URL
      audioUrl = `https://server${serverIndex}.mp3quran.net/${reader}/${surahId}.mp3`;
    }

    // Check if audio file exists
    fetch(audioUrl, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          audioPlayer.src = audioUrl;
          errorMessage.textContent = "";
        } else {
          tryAudioSources(reader, surahId, recitationType, serverIndex + 1);
        }
      })
      .catch(() =>
        tryAudioSources(reader, surahId, recitationType, serverIndex + 1)
      );
  }

  // Event Listeners
  // Event Listeners for Surah and Recitation changes
surahSelect.addEventListener("change", function () {
  const selectedSurah = parseInt(surahSelect.value, 10);
  playAudioButton.textContent = "تشغيل الصوت";
  playAudioButton.style.background = "#4CAF50";
  loadQuranData(reader, selectedSurah, recitationSelect.value);
});

recitationSelect.addEventListener("change", function () {
  playAudioButton.textContent = "تشغيل الصوت";
  playAudioButton.style.background = "#4CAF50";
  loadQuranData(reader, surahSelect.value, recitationSelect.value);
});

// Play audio button logic
playAudioButton.addEventListener("click", function () {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playAudioButton.textContent = "إيقاف الصوت";
    playAudioButton.style.background = "#FF6347"; 
  } else {
    audioPlayer.pause();
    playAudioButton.textContent = "تشغيل الصوت";
    playAudioButton.style.background = "#4CAF50"; 
  }
});

// Listen for play and pause events from the audio player itself
audioPlayer.addEventListener("play", function () {
  playAudioButton.textContent = "إيقاف الصوت";
  playAudioButton.style.background = "#FF6347"; 
});

audioPlayer.addEventListener("pause", function () {
  playAudioButton.textContent = "تشغيل الصوت";
  playAudioButton.style.background = "#4CAF50"; 
});

// Text size slider logic
textSizeSlider.addEventListener("input", function () {
  const newSize = textSizeSlider.value + "px";
  quranTextElement.style.fontSize = newSize;
});

});
