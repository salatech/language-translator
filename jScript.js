const fromText = document.querySelector('.from-text'),
    toText = document.querySelector('.to-text');
const selectTag = document.querySelectorAll('select'),
    exchangeIcon = document.querySelector('.exchange'),
    icons = document.querySelectorAll('.row i'),
translatebtn = document.querySelector('button');
//console.log(selectTag);

selectTag.forEach(function (tag, id) {
    for (const country_code in countries) {
        //console.log(countries[country_code]);
        let selected;
        if (id == 0 && country_code == "en-GB") {
            selected = "selected";
        } else if (id == 1 && country_code == "yo-NG") {
            selected = "selected";
        }
        let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

//Exchanging select value and textarea value
exchangeIcon.addEventListener('click', function () {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;

    fromText.value = toText.value;
    selectTag[0].value = selectTag[1].value;

    toText.value = tempText;
    selectTag[1].value = tempLang;
});

translatebtn.addEventListener("click", function () {
    let text = fromText.value,
        translateFrom = selectTag[0].value, //getting fromSelect tag value
        translateTo = selectTag[1].value;//getting toSelect tag value
        if(!text) return;
        toText.setAttribute("placeholder", "Translating...");
    let apiUrl =`https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    //fetch api response and returning it with parsing into js obj
    // and in another then method rceiving the obj
    fetch(apiUrl).then(res => res.json()).then(data => {
       // console.log(data);
        toText.value = data.responseData.translatedText;
        toText.setAttribute("placeholder", "Translating...");
    });
    //console.log(text, translateFrom,translateTo );
});
icons.forEach(function(icon){
    icon.addEventListener('click', function ({ target }) {
        //console.log(target)
        if(target.classList.contains("fa-copy")){
            if(target.id == 'from'){
                //console.log('From copy icon clicked')
                navigator.clipboard.writeText(fromText.value);
            }else{
               // console.log('To copy icon clicked');
                navigator.clipboard.writeText(toText.value);
            }
        }else{
           // console.log('speech icon clicked')
           let utterance;
           if(target.id == 'from'){
            utterance = new SpeechSynthesisUtterance(fromText.value);
            utterance.lang = selectTag[0].value; //setting utterance language to from select tag value
        }else{
            utterance = new SpeechSynthesisUtterance(toText.value);
            utterance.lang = selectTag[1].value; //setting utterance language to to select tag value
        }
        speechSynthesis.speak(utterance); //speak the passed utterance
        }
        });
})