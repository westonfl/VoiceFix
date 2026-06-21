import type { MainAppLanguage } from './localization';

export type TakeMetrics = {
  durationMs: number;
};

type AnalysisLanguage = MainAppLanguage;

export function buildMvpFeedback(firstTake: TakeMetrics, language: AnalysisLanguage = 'en') {
  const seconds = Math.max(0, Math.round(firstTake.durationMs / 100) / 10);
  const text = feedbackText[language];

  if (firstTake.durationMs < 2500) {
    return {
      observation: text.shortObservation(seconds),
      interpretation: text.shortInterpretation,
      cue: text.shortCue,
    };
  }

  if (firstTake.durationMs > 9000) {
    return {
      observation: text.longObservation(seconds),
      interpretation: text.longInterpretation,
      cue: text.longCue,
    };
  }

  return {
    observation: text.usefulObservation(seconds),
    interpretation: text.usefulInterpretation,
    cue: text.usefulCue,
  };
}

export function compareTakes(firstTake: TakeMetrics, retryTake: TakeMetrics, language: AnalysisLanguage = 'en') {
  const delta = retryTake.durationMs - firstTake.durationMs;
  const text = feedbackText[language];

  if (Math.abs(delta) < 500) {
    return text.sameComparison;
  }

  if (delta > 0) {
    return text.longerComparison;
  }

  return text.shorterComparison;
}

export function formatDuration(durationMs: number) {
  return `${Math.max(0, Math.round(durationMs / 100) / 10).toFixed(1)}s`;
}

const feedbackText: Record<MainAppLanguage, {
  shortObservation: (seconds: number) => string;
  shortInterpretation: string;
  shortCue: string;
  longObservation: (seconds: number) => string;
  longInterpretation: string;
  longCue: string;
  usefulObservation: (seconds: number) => string;
  usefulInterpretation: string;
  usefulCue: string;
  sameComparison: string;
  longerComparison: string;
  shorterComparison: string;
}> = {
  en: {
    shortObservation: (seconds) => `What we heard: the first take was short, about ${seconds}s.`,
    shortInterpretation: 'That often means the sound ended before the exercise had time to settle.',
    shortCue: 'Try the same drill with a smaller sound so it can last a little longer.',
    longObservation: (seconds) => `What we heard: the take lasted about ${seconds}s, which is plenty for this drill.`,
    longInterpretation: 'Longer is not automatically better; steadiness matters more than pushing duration.',
    longCue: 'Try the same drill slightly softer and stop before the throat works hard.',
    usefulObservation: (seconds) => `What we heard: the take lasted about ${seconds}s, a useful length for comparison.`,
    usefulInterpretation: 'That gives Rehear enough material to compare one small change.',
    usefulCue: 'Try the same drill again with an easier start and a cleaner ending.',
    sameComparison: 'Retry result: about the same length, which is useful. Listen for whether the second take felt easier.',
    longerComparison: 'Retry result: the second take lasted a little longer. That often means the start used less effort.',
    shorterComparison: 'Retry result: the second take was shorter. That can still be useful if it felt easier or less pushed.',
  },
  es: {
    shortObservation: (seconds) => `Lo que escuchamos: la primera toma fue corta, unos ${seconds}s.`,
    shortInterpretation: 'Eso suele significar que el sonido terminó antes de asentarse.',
    shortCue: 'Haz el mismo ejercicio con un sonido más pequeño para que dure un poco más.',
    longObservation: (seconds) => `Lo que escuchamos: la toma duró unos ${seconds}s, suficiente para este ejercicio.`,
    longInterpretation: 'Más largo no siempre es mejor; importa más la estabilidad que empujar duración.',
    longCue: 'Empieza un poco más suave y detente antes de que la garganta trabaje de más.',
    usefulObservation: (seconds) => `Lo que escuchamos: la toma duró unos ${seconds}s, útil para comparar.`,
    usefulInterpretation: 'Rehear tiene material suficiente para comparar un cambio pequeño.',
    usefulCue: 'Repite el mismo ejercicio con un inicio más fácil y un final más limpio.',
    sameComparison: 'Resultado del reintento: duración parecida. Escucha si la segunda toma se sintió más fácil.',
    longerComparison: 'Resultado del reintento: la segunda toma duró un poco más. Puede indicar menos esfuerzo al empezar.',
    shorterComparison: 'Resultado del reintento: la segunda toma fue más corta. Aun sirve si se sintió más fácil o menos forzada.',
  },
  pt: {
    shortObservation: (seconds) => `O que ouvimos: a primeira tomada foi curta, cerca de ${seconds}s.`,
    shortInterpretation: 'Isso costuma indicar que o som terminou antes de estabilizar.',
    shortCue: 'Faça o mesmo exercício com um som menor para durar um pouco mais.',
    longObservation: (seconds) => `O que ouvimos: a tomada durou cerca de ${seconds}s, suficiente para este exercício.`,
    longInterpretation: 'Mais longo não é automaticamente melhor; estabilidade importa mais que forçar duração.',
    longCue: 'Comece um pouco mais suave e pare antes da garganta trabalhar demais.',
    usefulObservation: (seconds) => `O que ouvimos: a tomada durou cerca de ${seconds}s, uma duração útil para comparar.`,
    usefulInterpretation: 'O Rehear tem material suficiente para comparar uma pequena mudança.',
    usefulCue: 'Repita o mesmo exercício com um começo mais fácil e um final mais limpo.',
    sameComparison: 'Resultado da repetição: duração parecida. Ouça se a segunda tomada pareceu mais fácil.',
    longerComparison: 'Resultado da repetição: a segunda tomada durou um pouco mais. Isso pode indicar menos esforço no início.',
    shorterComparison: 'Resultado da repetição: a segunda tomada foi mais curta. Ainda é útil se pareceu mais fácil ou menos forçada.',
  },
  fr: {
    shortObservation: (seconds) => `Ce que nous avons entendu : la première prise était courte, environ ${seconds}s.`,
    shortInterpretation: 'Cela veut souvent dire que le son s’est arrêté avant de se poser.',
    shortCue: 'Refaites le même exercice avec un son plus petit pour le faire durer un peu plus.',
    longObservation: (seconds) => `Ce que nous avons entendu : la prise a duré environ ${seconds}s, assez pour cet exercice.`,
    longInterpretation: 'Plus long n’est pas toujours mieux ; la stabilité compte plus que la durée forcée.',
    longCue: 'Commencez un peu plus doucement et arrêtez avant que la gorge force.',
    usefulObservation: (seconds) => `Ce que nous avons entendu : la prise a duré environ ${seconds}s, utile pour comparer.`,
    usefulInterpretation: 'Rehear a assez de matière pour comparer un petit changement.',
    usefulCue: 'Refaites le même exercice avec un départ plus facile et une fin plus propre.',
    sameComparison: 'Résultat de la reprise : durée similaire. Écoutez si la deuxième prise semblait plus facile.',
    longerComparison: 'Résultat de la reprise : la deuxième prise a duré un peu plus. Le départ a peut-être demandé moins d’effort.',
    shorterComparison: 'Résultat de la reprise : la deuxième prise était plus courte. C’est utile si elle semblait plus facile ou moins poussée.',
  },
  de: {
    shortObservation: (seconds) => `Gehört: Der erste Take war kurz, etwa ${seconds}s.`,
    shortInterpretation: 'Das bedeutet oft, dass der Klang endete, bevor er sich setzen konnte.',
    shortCue: 'Mach dieselbe Übung mit kleinerem Klang, damit sie etwas länger hält.',
    longObservation: (seconds) => `Gehört: Der Take dauerte etwa ${seconds}s, genug für diese Übung.`,
    longInterpretation: 'Länger ist nicht automatisch besser; Stabilität zählt mehr als erzwungene Dauer.',
    longCue: 'Starte etwas sanfter und stoppe, bevor der Hals hart arbeitet.',
    usefulObservation: (seconds) => `Gehört: Der Take dauerte etwa ${seconds}s, eine nützliche Vergleichslänge.`,
    usefulInterpretation: 'Rehear hat genug Material, um eine kleine Änderung zu vergleichen.',
    usefulCue: 'Wiederhole dieselbe Übung mit leichterem Start und saubererem Ende.',
    sameComparison: 'Retry-Ergebnis: ungefähr gleiche Länge. Achte darauf, ob sich der zweite Take leichter anfühlte.',
    longerComparison: 'Retry-Ergebnis: Der zweite Take dauerte etwas länger. Das deutet oft auf weniger Aufwand am Anfang hin.',
    shorterComparison: 'Retry-Ergebnis: Der zweite Take war kürzer. Das ist trotzdem nützlich, wenn er leichter oder weniger gedrückt war.',
  },
  ja: {
    shortObservation: (seconds) => `聞こえたこと: 最初のテイクは約${seconds}秒で短めでした。`,
    shortInterpretation: '音が安定する前に終わった可能性があります。',
    shortCue: '同じドリルを少し小さな音で行い、もう少し長く続けてみましょう。',
    longObservation: (seconds) => `聞こえたこと: テイクは約${seconds}秒で、このドリルには十分です。`,
    longInterpretation: '長ければ良いわけではありません。無理に伸ばすより安定が大事です。',
    longCue: '少しやさしく始め、喉が頑張る前に止めてみましょう。',
    usefulObservation: (seconds) => `聞こえたこと: テイクは約${seconds}秒で、比較に使いやすい長さでした。`,
    usefulInterpretation: 'Rehear が小さな変化を比べるには十分な材料です。',
    usefulCue: '同じドリルを、より楽な出だしときれいな終わりでやり直しましょう。',
    sameComparison: 'リトライ結果: 長さはほぼ同じです。2回目がより楽に感じたか聞いてみましょう。',
    longerComparison: 'リトライ結果: 2回目の方が少し長く続きました。出だしの力みが減った可能性があります。',
    shorterComparison: 'リトライ結果: 2回目は短くなりました。それでも楽で押していないなら有用な材料です。',
  },
  ko: {
    shortObservation: (seconds) => `들린 점: 첫 테이크가 약 ${seconds}초로 짧았습니다.`,
    shortInterpretation: '소리가 안정되기 전에 끝났을 가능성이 있습니다.',
    shortCue: '같은 드릴을 더 작은 소리로 시작해서 조금 더 오래 이어보세요.',
    longObservation: (seconds) => `들린 점: 테이크가 약 ${seconds}초로 이 드릴에는 충분히 길었습니다.`,
    longInterpretation: '길게 버티는 것보다 목에 힘을 주지 않고 일정하게 유지하는 것이 더 중요합니다.',
    longCue: '조금 더 부드럽게 시작하고 목이 일하기 전에 멈춰보세요.',
    usefulObservation: (seconds) => `들린 점: 테이크가 약 ${seconds}초로 비교하기에 알맞은 길이였습니다.`,
    usefulInterpretation: 'Rehear가 한 가지 변화를 비교하기에 충분한 자료입니다.',
    usefulCue: '같은 드릴을 더 쉬운 시작과 더 깔끔한 끝으로 다시 해보세요.',
    sameComparison: '재시도 결과: 길이는 거의 비슷합니다. 두 번째 테이크가 더 쉽게 느껴졌는지 들어보세요.',
    longerComparison: '재시도 결과: 두 번째 테이크가 조금 더 길었습니다. 시작할 때 힘이 줄었을 가능성이 있습니다.',
    shorterComparison: '재시도 결과: 두 번째 테이크가 더 짧았습니다. 그래도 더 쉽고 덜 밀어낸 느낌이었다면 좋은 자료입니다.',
  },
  zhHans: {
    shortObservation: (seconds) => `我们听到：第一条录音较短，约 ${seconds} 秒。`,
    shortInterpretation: '这通常表示声音还没稳定就结束了。',
    shortCue: '用更小的声音做同一练习，让它稍微持续久一点。',
    longObservation: (seconds) => `我们听到：录音约 ${seconds} 秒，对这个练习已经足够。`,
    longInterpretation: '更长不一定更好；稳定比硬撑时长更重要。',
    longCue: '稍微轻一点开始，在喉咙用力前停下。',
    usefulObservation: (seconds) => `我们听到：录音约 ${seconds} 秒，适合用于比较。`,
    usefulInterpretation: 'Rehear 有足够材料来比较一个小变化。',
    usefulCue: '用更轻松的开始和更干净的结尾再做一次同一练习。',
    sameComparison: '重试结果：长度差不多。听听第二条是否更轻松。',
    longerComparison: '重试结果：第二条稍微更长。这通常表示开始时用力更少。',
    shorterComparison: '重试结果：第二条更短。如果感觉更轻松或更少用力，仍然有价值。',
  },
  zhHant: {
    shortObservation: (seconds) => `我們聽到：第一條錄音較短，約 ${seconds} 秒。`,
    shortInterpretation: '這通常表示聲音還沒穩定就結束了。',
    shortCue: '用更小的聲音做同一練習，讓它稍微持續久一點。',
    longObservation: (seconds) => `我們聽到：錄音約 ${seconds} 秒，對這個練習已經足夠。`,
    longInterpretation: '更長不一定更好；穩定比硬撐時長更重要。',
    longCue: '稍微輕一點開始，在喉嚨用力前停下。',
    usefulObservation: (seconds) => `我們聽到：錄音約 ${seconds} 秒，適合用於比較。`,
    usefulInterpretation: 'Rehear 有足夠材料來比較一個小變化。',
    usefulCue: '用更輕鬆的開始和更乾淨的結尾再做一次同一練習。',
    sameComparison: '重試結果：長度差不多。聽聽第二條是否更輕鬆。',
    longerComparison: '重試結果：第二條稍微更長。這通常表示開始時用力更少。',
    shorterComparison: '重試結果：第二條更短。如果感覺更輕鬆或更少用力，仍然有價值。',
  },
  hi: {
    shortObservation: (seconds) => `हमने सुना: पहली टेक छोटी थी, लगभग ${seconds}s.`,
    shortInterpretation: 'अक्सर इसका मतलब है कि आवाज़ स्थिर होने से पहले खत्म हो गई.',
    shortCue: 'उसी अभ्यास को छोटी आवाज़ से करें ताकि वह थोड़ा और टिके.',
    longObservation: (seconds) => `हमने सुना: टेक लगभग ${seconds}s चली, इस अभ्यास के लिए काफी है.`,
    longInterpretation: 'लंबा हमेशा बेहतर नहीं होता; ज़ोर लगाने से ज्यादा स्थिरता मायने रखती है.',
    longCue: 'थोड़ा नरम शुरू करें और गला ज्यादा काम करे उससे पहले रुकें.',
    usefulObservation: (seconds) => `हमने सुना: टेक लगभग ${seconds}s चली, तुलना के लिए उपयोगी लंबाई.`,
    usefulInterpretation: 'Rehear के पास एक छोटे बदलाव की तुलना के लिए पर्याप्त सामग्री है.',
    usefulCue: 'उसी अभ्यास को आसान शुरुआत और साफ अंत के साथ फिर करें.',
    sameComparison: 'दोबारा परिणाम: लंबाई लगभग समान है. सुनें कि दूसरी टेक आसान लगी या नहीं.',
    longerComparison: 'दोबारा परिणाम: दूसरी टेक थोड़ी लंबी चली. इसका मतलब शुरुआत में कम जोर हो सकता है.',
    shorterComparison: 'दोबारा परिणाम: दूसरी टेक छोटी थी. अगर वह आसान या कम धक्का लगी तो यह फिर भी उपयोगी है.',
  },
  ar: {
    shortObservation: (seconds) => `ما سمعناه: كان التسجيل الأول قصيرا، حوالي ${seconds} ثوان.`,
    shortInterpretation: 'غالبا يعني ذلك أن الصوت انتهى قبل أن يستقر.',
    shortCue: 'جرّب التمرين نفسه بصوت أصغر ليبقى أطول قليلا.',
    longObservation: (seconds) => `ما سمعناه: استمر التسجيل حوالي ${seconds} ثوان، وهذا كاف لهذا التمرين.`,
    longInterpretation: 'الأطول ليس أفضل دائما؛ الثبات أهم من دفع المدة.',
    longCue: 'ابدأ بلطف أكثر وتوقف قبل أن يعمل الحلق بقوة.',
    usefulObservation: (seconds) => `ما سمعناه: استمر التسجيل حوالي ${seconds} ثوان، وهي مدة مفيدة للمقارنة.`,
    usefulInterpretation: 'لدى Rehear مادة كافية لمقارنة تغيير صغير واحد.',
    usefulCue: 'أعد التمرين نفسه ببداية أسهل ونهاية أنظف.',
    sameComparison: 'نتيجة الإعادة: المدة متقاربة. استمع هل كان التسجيل الثاني أسهل.',
    longerComparison: 'نتيجة الإعادة: التسجيل الثاني استمر أطول قليلا. هذا غالبا يعني جهدا أقل في البداية.',
    shorterComparison: 'نتيجة الإعادة: التسجيل الثاني كان أقصر. ما زال مفيدا إذا كان أسهل أو أقل ضغطا.',
  },
  id: {
    shortObservation: (seconds) => `Yang terdengar: take pertama pendek, sekitar ${seconds}s.`,
    shortInterpretation: 'Itu sering berarti suara selesai sebelum sempat stabil.',
    shortCue: 'Coba latihan yang sama dengan suara lebih kecil agar bisa sedikit lebih lama.',
    longObservation: (seconds) => `Yang terdengar: take berlangsung sekitar ${seconds}s, cukup untuk latihan ini.`,
    longInterpretation: 'Lebih lama tidak selalu lebih baik; stabil lebih penting daripada memaksa durasi.',
    longCue: 'Mulai sedikit lebih lembut dan berhenti sebelum tenggorokan bekerja keras.',
    usefulObservation: (seconds) => `Yang terdengar: take berlangsung sekitar ${seconds}s, panjang yang berguna untuk dibandingkan.`,
    usefulInterpretation: 'Rehear punya cukup bahan untuk membandingkan satu perubahan kecil.',
    usefulCue: 'Ulangi latihan yang sama dengan awal lebih mudah dan akhir lebih bersih.',
    sameComparison: 'Hasil ulang: durasinya hampir sama. Dengarkan apakah take kedua terasa lebih mudah.',
    longerComparison: 'Hasil ulang: take kedua sedikit lebih lama. Itu sering berarti awalnya memakai lebih sedikit tenaga.',
    shorterComparison: 'Hasil ulang: take kedua lebih pendek. Tetap berguna kalau terasa lebih mudah atau tidak terlalu dipaksa.',
  },
};
