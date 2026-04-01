const QUESTION_PAIRS = [
  {
    normal: "Opisz swój idealny weekend.",
    impostor: "Opisz swój idealny poniedziałek w pracy."
  },
  {
    normal: " Kto jest dla ciebie autorytetem?",
    impostor: "Jaka jest twoja ulubiona postać z komiksu?"
  },
  {
  normal: "Podaj swój ulubiony owoc.",
  impostor: "Podaj swój najmniej lubiany owoc."
  },
  {
  normal: "Podaj swój ulubiony film.",
  impostor: "Podaj film na podstawie książki."
  },
  {
  normal: "Podaj swój ulubiony kolor.",
  impostor: "Podaj kolor, który widzisz gdzieś obok siebie."
  },
  {
  normal: "Podaj swój ulubiony przedmiot szkolny.",
  impostor: "Podaj najnudniejszy przedmiot szkolny."
  },
  {
    normal: "Co byś zrobił mając milion złotych?",
    impostor: "Co byś zrobił mając milion długu?"
  },
  {
    normal: "Jak wygląda Twoje wymarzone mieszkanie?",
    impostor: "Jak wygląda Twoje wymarzone biuro?"
  },
  {
    normal: "Opisz najlepszą kolację w swoim życiu.",
    impostor: "Opisz najgorszą kolacje w swoim życiu."
  },
  {
    normal: "Gdybyś mógł podróżować gdziekolwiek, dokąd byś pojechał?",
    impostor: "Gdybyś musiał zostać w jednym miejscu na zawsze, gdzie by to było?"
  },
  {
    normal: "Jaka jest Twoja ulubiona pora roku?",
    impostor: "Jaka pora roku najbardziej Ci przeszkadza?"
  },
  {
    normal: "Opisz swój idealny dzień od rana do wieczora.",
    impostor: "Opisz swój typowy dzień od rana do wieczora."
  },
  {
    normal: "Co byś zabrał na bezludną wyspę?",
    impostor: "Co byś zabrał na tygodniowy kemping z rodziną?"
  },
  {
    normal: "Jaki supermoc chciałbyś mieć?",
    impostor: "Jaka supermoc byłaby dla Ciebie bezużyteczna?"
  },
  {
    normal: "Jak świętowałbyś wygranie na loterii?",
    impostor: "Jak świętowałbyś koniec trudnego projektu w pracy?"
  },
  {
    normal: "Twój ulubiony film.",
    impostor: "Jaki film ostatnio oglądałeś?"
  },
  {
    normal: "Gdybyś mógł żyć w dowolnym znanym wydarzeniu historycznym, kiedy by to było?",
    impostor: "Gdybyś mógł zmienić jedno wydarzenie historyczne, co by to było?"
  },
  {
    normal: "Podaj zapach, który kojarzy ci się dobrze.",
    impostor: "Podaj zapach, który kojarzy ci się źle."
  },
  {
    normal: "Podaj przedmiot, bez którego nie ruszasz się z domu.",
    impostor: "Podaj przedmiot, którego w domu najbardziej nie lubisz widzieć."
  },
  {
    normal: "Podaj gatunek muzyki, który lubisz najbardziej.",
    impostor: "Podaj gatunek muzyki, którego nie znosisz."
  },
  {
    normal: "Podaj instrument, który najbardziej ci się podoba.",
    impostor: "Podaj instrument, którego dźwięk ci przeszkadza."
  },
  {
    normal: "Podaj zimowy sport, który kojarzy ci się z siłą.",
    impostor: "Podaj sport, który kojarzy ci się z olimpiadą zimową?"
  },
  {
    normal: "Podaj sport, który kojarzy ci się z siłą.",
    impostor: "Podaj sport, który kojarzy ci się ze słabością."
  },
  {
    normal: "Co lubisz robić w deszczowy dzień?",
    impostor: "Co lubisz robić w upalny, słoneczny dzień?"
  },
  {
    normal: "Podaj zjawisko, które uważasz za piękne.",
    impostor: "Podaj zjawisko, które uważasz za niepokojące."
  },
  {
    normal: "Podaj rzecz, którą najczęściej bierzesz do ręki.",
    impostor: "Podaj rzecz, którą masz w kuchni."
  },
  { 
    normal: "Podaj słowo, które brzmi jak coś ważnego.", 
    impostor: "Podaj słowo, którego często używasz." 
  },
  {
    normal: "ile czasu spędzasz przed ekranami?",
    impostor: "ile czasu śpisz?"
  },
  {
    normal: "ile miałeś w życiu telefonów?",
    impostor: "ile masz w domu pomieszczeń?"
  },
  {
    normal: "Jakie jedzenie mógłbyś jeść codziennie?",
    impostor: "Jakiego jedzenia nigdy więcej nie chciałbyś zjeść?"
  },
  {
    normal: "Opisz swoje idealne wakacje.",
    impostor: "Opisz wycieczkę szkolną, którą pamiętasz."
  }
];

class QuestionManager {
  constructor() {
    this.usedIndices = new Set();
  }

  getRandomPair() {
    const available = QUESTION_PAIRS
      .map((_, i) => i)
      .filter(i => !this.usedIndices.has(i));

    if (available.length === 0) {
      this.usedIndices.clear();
      return this.getRandomPair();
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    this.usedIndices.add(idx);
    return QUESTION_PAIRS[idx];
  }

  reset() {
    this.usedIndices.clear();
  }
}

module.exports = QuestionManager;
