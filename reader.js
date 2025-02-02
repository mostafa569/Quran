document.addEventListener("DOMContentLoaded", function () {
  const readerNameElement = document.getElementById("reader-name");
  const surahNameElement = document.getElementById("surah-name");
  const quranTextElement = document.getElementById("quran-text");
  const audioPlayer = document.getElementById("audio-player");
  const playAudioButton = document.getElementById("play-audio");
  const surahSelect = document.getElementById("surah-select");
  const textSizeSlider = document.getElementById("text-size");
  const recitationSelect = document.getElementById("recitation-select");
  const errorMessage = document.getElementById("error-message");

  const readerNames = {
    abu_bakr_shatri: "أبو بكر الشاطري",
    abdul_baset: "عبدالباسط عبدالصمد",
    abdurrahmaan_as_sudais: "عبدالرحمن السديس",
    hani_ar_rifai: "هاني الرفاعي",
    khalil_al_husary: "محمود خليل الحصري",
    mishari_al_afasy: "مشاري راشد العفاسي",
    siddiq_minshawi: "محمد صديق المنشاوي",
    saud_ash_shuraym: "سعود الشريم",
    fares: "فارس",
    ahmed_ibn_3ali_al_3ajamy:"احمد علي العجمي",
    muhammad_ayyoob:"محمد أيوب"
  };

  const urlParams = new URLSearchParams(window.location.search);
  const reader = urlParams.get("reader");

  if (reader) {
    const formattedReader = reader.replace(/-/g, "_");
    readerNameElement.textContent = `القارئ: ${readerNames[formattedReader]}`;
    loadQuranData(reader, 1, "murattal");
  }

  function loadQuranData(reader, surahId, recitationStyle) {
    const quranTextAPI = `https://api.alquran.cloud/v1/surah/${surahId}`;
    // const surahMetaAPI = `https://api.alquran.cloud/v1/meta`;

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

        const audioSources = [
          `https://download.quranicaudio.com/qdc/${reader}/${recitationStyle}/${surahId}.mp3`,
          `https://download.quranicaudio.com/qdc/${reader}/${recitationStyle}/00${surahId}.mp3`,
          `https://another-audio-source.com/${reader}/${recitationStyle}/${surahId}.mp3`,
          `https://download.quranicaudio.com/quran/${reader}/00${surahId}.mp3`,
          `https://download.quranicaudio.com/quran/${reader}//00${surahId}.mp3`

        ];

        tryAudioSources(audioSources, 0);
      })
      .catch((error) => console.log("Error fetching Quran data:", error));

    // fetch(surahMetaAPI)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     const surahs = data.data.surahs;
    //     surahs.forEach((surah) => {
    //       const option = document.createElement("option");
    //       option.value = surah.number;
    //       option.textContent = surah.name;
    //       surahSelect.appendChild(option);
    //     });
    //   })
    //   .catch((error) => console.log("Error fetching surah list:", error));
  }

  function tryAudioSources(sources, index) {
    if (index >= sources.length) {
      errorMessage.textContent = "التلاوة غير متوفرة لهذا القارئ";
      audioPlayer.src = "";
      return;
    }

    const audioUrl = sources[index];

    fetch(audioUrl, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          audioPlayer.src = audioUrl; // Update the audio player source
          errorMessage.textContent = "";
        } else {
          tryAudioSources(sources, index + 1);
        }
      })
      .catch((error) => {
        console.log("Error checking audio URL:", error);
        tryAudioSources(sources, index + 1);
      });
  }

  surahSelect.addEventListener("change", function () {
    const selectedSurah = surahSelect.value;
    const selectedRecitation = recitationSelect.value;
    playAudioButton.textContent = "تشغيل الصوت";
    playAudioButton.style.background = "#4CAF50";
    loadQuranData(reader, selectedSurah, selectedRecitation);
  });

  recitationSelect.addEventListener("change", function () {
    const selectedRecitation = recitationSelect.value;
    const selectedSurah = surahSelect.value;
    playAudioButton.textContent = "تشغيل الصوت";
    playAudioButton.style.background = "#4CAF50";
    loadQuranData(reader, selectedSurah, selectedRecitation);
  });

  textSizeSlider.addEventListener("input", function () {
    quranTextElement.style.fontSize = textSizeSlider.value + "px";
  });
  audioPlayer.addEventListener("play", function () {
    playAudioButton.textContent = "إيقاف الصوت";
    playAudioButton.style.background = "red";
  });

  audioPlayer.addEventListener("pause", function () {
    playAudioButton.textContent = "تشغيل الصوت";
    playAudioButton.style.background = "#4CAF50";
  });
  playAudioButton.addEventListener("click", function () {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playAudioButton.textContent = "إيقاف الصوت";
      playAudioButton.style.background = "red";
    } else {
      audioPlayer.pause();
      playAudioButton.textContent = "تشغيل الصوت";
      playAudioButton.style.background = "#4CAF50";
    }
  });
});

 