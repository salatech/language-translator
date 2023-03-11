const fromText = document.querySelector('.from-text');
const toText = document.querySelector('.to-text');
const selectTag = document.querySelectorAll('select');
const exchangeIcon = document.querySelector('.exchange');
const icons = document.querySelectorAll('.row i');
const translatebtn = document.querySelector('button');

// Loop over select tags to populate with options
selectTag.forEach((tag, id) => {
  for (const country_code in countries) {
    const selected = (id === 0 && country_code === "en-GB") || (id === 1 && country_code === "yo-NG") ? "selected" : "";
    const option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

//Exchanging select value and textarea value
exchangeIcon.addEventListener('click', () => {
  [fromText.value, toText.value] = [toText.value, fromText.value];
  [selectTag[0].value, selectTag[1].value] = [selectTag[1].value, selectTag[0].value];
});

// Translate button click handler
translatebtn.addEventListener("click", () => {
  const text = fromText.value.trim();
  const translateFrom = selectTag[0].value;
  const translateTo = selectTag[1].value;
  if (!text) return;
  toText.setAttribute("placeholder", "Translating...");
  const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
  fetch(apiUrl).then(res => res.json()).then(data => {
    toText.value = data.responseData.translatedText;
    toText.setAttribute("placeholder", "");
  });
});

// Loop over icons to add click handlers
icons.forEach(icon => {
  icon.addEventListener('click', ({ target }) => {
    if (target.classList.contains("fa-copy")) {
      navigator.clipboard.writeText(target.id === 'from' ? fromText.value : toText.value);
    } else {
      const utterance = new SpeechSynthesisUtterance(target.id === 'from' ? fromText.value : toText.value);
      utterance.lang = selectTag[target.id === 'from' ? 0 : 1].value;
      speechSynthesis.speak(utterance);
    }
  });
});
