import type { Lang } from './site';

// The version history page lists the releases of CHANGELOG.md (English, the source of truth),
// newest first. This file adds the other languages. When a release is added to CHANGELOG.md
// without translations here, its English notes are shown, marked as English only.

/** Releases with only internal changes (tooling, deployment, clean-up); not listed. */
export const internalReleases = new Set(['1.6.1', '1.2.1', '1.2.0']);

export interface ReleaseText {
  summary?: string;
  notes: string[];
}

export const translations: Record<string, Partial<Record<Exclude<Lang, 'en'>, ReleaseText>>> = {
  '1.12.2': {
    de: {
      notes: [
        'Geräte passen vollständig unter einen langen Titel und Untertitel, sodass auch der untere Bildschirmrand, etwa eine Tab-Leiste, sichtbar bleibt. Ein Gerät am Rand gegenüber dem Text ragt weiterhin über den Rand hinaus.',
      ],
    },
    fr: {
      notes: [
        'Les appareils tiennent en entier sous un long titre et un long sous-titre, de sorte que ce qui se trouve en bas de l’écran, comme une barre d’onglets, reste visible. Un appareil placé sur le bord opposé au texte continue de déborder de celui-ci.',
      ],
    },
    es: {
      notes: [
        'Los dispositivos caben enteros bajo un título y un subtítulo largos, así que lo que hay en la parte inferior de la pantalla, como una barra de pestañas, sigue a la vista. Un dispositivo colocado en el borde opuesto al texto sigue saliéndose por él.',
      ],
    },
    it: {
      notes: [
        'I dispositivi entrano per intero sotto un titolo e un sottotitolo lunghi, così ciò che si trova in fondo allo schermo, come una barra di schede, resta visibile. Un dispositivo posizionato sul bordo opposto al testo continua a uscire da quel bordo.',
      ],
    },
    ja: {
      notes: [
        '長いタイトルとサブタイトルの下でもデバイス全体が収まるようになり、タブバーなど画面下部の内容も見えたままになります。テキストと反対側の端に配置したデバイスは、これまでどおり端からはみ出します。',
      ],
    },
    zh: {
      notes: [
        '设备现在可以完整地放在较长的标题和副标题下方，因此屏幕底部的内容（例如标签栏）也能保持可见。放在文字对侧边缘的设备仍会超出该边缘。',
      ],
    },
    'pt-br': {
      notes: [
        'Os dispositivos cabem inteiros abaixo de um título e um subtítulo longos, então o que fica na parte de baixo da tela, como uma barra de abas, continua visível. Um dispositivo posicionado na borda oposta ao texto continua saindo por ela.',
      ],
    },
    nl: {
      notes: [
        'Apparaten passen volledig onder een lange titel en ondertitel, zodat wat onderaan het scherm staat, zoals een tabbalk, in beeld blijft. Een apparaat aan de rand tegenover de tekst loopt nog steeds over de rand door.',
      ],
    },
    ko: {
      notes: [
        '긴 제목과 부제목 아래에도 기기가 통째로 들어가서, 탭 막대처럼 화면 아래쪽에 있는 내용도 계속 보여요. 텍스트 반대편 가장자리에 놓은 기기는 지금처럼 가장자리 밖으로 이어져요.',
      ],
    },
    ru: {
      notes: [
        'Устройства целиком помещаются под длинным заголовком и подзаголовком, так что содержимое внизу экрана, например панель вкладок, остаётся на виду. Устройство, размещённое у края напротив текста, по-прежнему выходит за этот край.',
      ],
    },
  },
  '1.12.1': {
    de: {
      notes: ['Eine neue Projektseite auf GitHub mit einer Galerie von Beispielen, die mit Storyframe entstanden sind.'],
    },
    fr: {
      notes: [
        'Une nouvelle page de projet sur GitHub, avec une galerie de réalisations créées avec Storyframe.',
      ],
    },
    es: {
      notes: [
        'Una nueva página del proyecto en GitHub con una galería de lo que se crea con Storyframe.',
      ],
    },
    it: {
      notes: [
        'Una nuova pagina del progetto su GitHub con una galleria di ciò che si crea con Storyframe.',
      ],
    },
    ja: {
      notes: [
        'GitHub に新しいプロジェクトページができました。Storyframe で作成した例のギャラリーを掲載しています。',
      ],
    },
    zh: {
      notes: [
        'GitHub 上新的项目页面，附有使用 Storyframe 制作的作品展示。',
      ],
    },
    'pt-br': {
      notes: [
        'Uma nova página do projeto no GitHub, com uma galeria do que é feito com o Storyframe.',
      ],
    },
    nl: {
      notes: [
        'Een nieuwe projectpagina op GitHub met een galerie van wat je met Storyframe kunt maken.',
      ],
    },
    ko: {
      notes: [
        'GitHub에 새 프로젝트 페이지가 생겼어요. Storyframe으로 만든 예시 갤러리도 함께 볼 수 있어요.',
      ],
    },
    ru: {
      notes: [
        'Новая страница проекта на GitHub с галереей работ, созданных в Storyframe.',
      ],
    },
  },
  '1.12.0': {
    de: {
      summary: 'Willkommen bei Storyframe: Der Screenshot-Generator hat einen Namen, ein Logo und eine eigene Farbe – dazu fertige Layouts und präzise Platzierung.',
      notes: [
        'Neuer Name und neues Aussehen: Storyframe, denn App-Store-Screenshots erzählen die Geschichte deiner App Bild für Bild. Mit Indigo als Akzentfarbe, einem neuen Icon und einem Home-Bildschirm-Icon, wenn du die Seite zu deinem Telefon hinzufügst.',
        'Exportierte ZIP-Dateien tragen den Namen Storyframe, zum Beispiel Storyframe_iPhone_6.9_en-US.zip.',
        'Sechs Layouts als Ausgangspunkt, als Live-Vorschau deines Bildschirms: Klassisch, Groß & kräftig, Schwebend, Text unten sowie Nach links und Nach rechts geneigt für iPhone und iPad.',
        'Text kann jetzt auch unter dem Gerät stehen. Große Geräte ragen immer über den Rand gegenüber dem Text hinaus, nie in ihn hinein.',
        'Jedes Layout lässt sich feinjustieren: Position, Größe, Neigung sowie links/rechts und oben/unten sind immer griffbereit, das Gerät rastet beim Ziehen in der Mitte ein, und die Pfeiltasten verschieben es (mit Umschalttaste in größeren Schritten).',
        'KI-Agenten können dieselben Layouts über den MCP-Server nutzen (layoutPreset, textPosition).',
      ],
    },
    fr: {
      summary: 'Voici Storyframe : le générateur de captures d’écran a un nom, un logo et sa propre couleur, ainsi que des mises en page prêtes à l’emploi et un placement précis.',
      notes: [
        'Nouveau nom et nouveau look : Storyframe, car les captures d’écran de l’App Store racontent l’histoire de ton app image par image. Avec l’indigo comme couleur d’accentuation, une nouvelle icône et une icône d’écran d’accueil lorsque tu ajoutes la page à ton téléphone.',
        'Les fichiers ZIP exportés portent le nom de Storyframe, par exemple Storyframe_iPhone_6.9_en-US.zip.',
        'Six mises en page comme point de départ, présentées en aperçu en direct de ton écran : Classique, Grand format, Flottant, Texte en bas, ainsi qu’Incliné à gauche et Incliné à droite pour iPhone et iPad.',
        'Le texte peut désormais se placer sous l’appareil. Les grands appareils débordent toujours du bord opposé au texte, jamais sur celui-ci.',
        'Ajuste finement chaque mise en page : la position, la taille, l’inclinaison, ainsi que gauche/droite et haut/bas sont toujours à portée de main, l’appareil s’aimante au centre pendant le glissement, et les touches fléchées le déplacent (avec Maj pour des pas plus grands).',
        'Les agents d’IA peuvent utiliser les mêmes mises en page via le serveur MCP (layoutPreset, textPosition).',
      ],
    },
    es: {
      summary: 'Te presentamos Storyframe: el generador de capturas de pantalla tiene nombre, logotipo y color propio, además de diseños listos para usar y una colocación precisa.',
      notes: [
        'Nuevo nombre y nuevo aspecto: Storyframe, porque las capturas de pantalla del App Store cuentan la historia de tu app fotograma a fotograma. Con el índigo como color de acento, un nuevo icono y un icono de pantalla de inicio cuando añades la página a tu teléfono.',
        'Los ZIP exportados llevan el nombre de Storyframe, por ejemplo Storyframe_iPhone_6.9_en-US.zip.',
        'Seis diseños para empezar, mostrados como vista previa en directo de tu pantalla: Clásico, Grande, Flotante y Texto abajo, además de Inclinado a la izquierda e Inclinado a la derecha para iPhone y iPad.',
        'Ahora el texto puede ir debajo del dispositivo. Los dispositivos grandes siempre se salen por el borde opuesto al texto, nunca hacia él.',
        'Ajusta con precisión cualquier diseño: la posición, el tamaño, la inclinación, izquierda/derecha y arriba/abajo están siempre a mano, el dispositivo se ajusta al centro al arrastrarlo y las teclas de flecha lo desplazan (con Mayúsculas, en pasos más grandes).',
        'Los agentes de IA pueden usar los mismos diseños a través del servidor MCP (layoutPreset, textPosition).',
      ],
    },
    it: {
      summary: 'Ecco Storyframe: il generatore di screenshot ha un nome, un logo e un colore tutto suo, oltre a layout pronti all’uso e un posizionamento preciso.',
      notes: [
        'Nuovo nome e nuovo look: Storyframe, perché gli screenshot dell’App Store raccontano la storia della tua app fotogramma per fotogramma. Con l’indaco come colore principale, una nuova icona e un’icona per la schermata Home quando aggiungi la pagina al telefono.',
        'I file ZIP esportati portano il nome di Storyframe, ad esempio Storyframe_iPhone_6.9_en-US.zip.',
        'Sei layout da cui partire, mostrati come anteprima dal vivo della tua schermata: Classico, Grande, Fluttuante, Testo sotto, e Inclinato a sinistra e Inclinato a destra per iPhone e iPad.',
        'Ora il testo può stare sotto il dispositivo. I dispositivi grandi escono sempre dal bordo opposto al testo, mai verso di esso.',
        'Regola con precisione qualsiasi layout: posizione, dimensione, inclinazione, sinistra/destra e su/giù sono sempre a portata di mano, il dispositivo si aggancia al centro durante il trascinamento e i tasti freccia lo spostano (con Maiusc a passi più ampi).',
        'Gli agenti di IA possono usare gli stessi layout tramite il server MCP (layoutPreset, textPosition).',
      ],
    },
    ja: {
      summary: 'Storyframe の登場です。スクリーンショットジェネレーターに名前とロゴ、独自のカラーが加わり、すぐに使えるレイアウトと精密な配置機能も搭載しました。',
      notes: [
        '新しい名前とデザイン：App Store のスクリーンショットはアプリのストーリーを1コマずつ伝えるものだから、Storyframe。インディゴのアクセントカラー、新しいアイコン、そしてスマートフォンに追加したときのホーム画面アイコンも用意しました。',
        '書き出した ZIP ファイルには Storyframe の名前が付きます（例：Storyframe_iPhone_6.9_en-US.zip）。',
        '出発点となる6つのレイアウトを、画面のライブプレビューで表示します：「クラシック」「ビッグ」「フローティング」「テキストを下に」、そして iPhone と iPad 用の「左に傾ける」「右に傾ける」。',
        'テキストをデバイスの下に配置できるようになりました。大きなデバイスは常にテキストと反対側の端からはみ出し、テキスト側にはみ出すことはありません。',
        'どのレイアウトも微調整できます。位置、サイズ、傾き、左右・上下の調整がいつでもすぐに使え、ドラッグ中はデバイスが中央にスナップし、矢印キーで少しずつ動かせます（Shift キーで大きく移動）。',
        'AI エージェントも MCP サーバー経由で同じレイアウトを使用できます（layoutPreset、textPosition）。',
      ],
    },
    zh: {
      summary: '隆重推出 Storyframe：截图生成器有了名字、标志和专属颜色，还新增了现成的布局和精确的位置调整。',
      notes: [
        '全新的名字和外观：Storyframe，因为 App Store 截图会一帧一帧地讲述你的 App 的故事。采用靛蓝色作为强调色，配有新图标，添加到手机时还有主屏幕图标。',
        '导出的 ZIP 文件以 Storyframe 命名，例如 Storyframe_iPhone_6.9_en-US.zip。',
        '六种布局可作为起点，以你的页面的实时预览呈现：经典、大气、悬浮、文字在下，以及适用于 iPhone 和 iPad 的向左倾斜和向右倾斜。',
        '文字现在可以放在设备下方。大尺寸设备总是从文字对侧的边缘超出，绝不会伸入文字一侧。',
        '可微调任意布局：位置、大小、倾斜以及左右和上下调整随时可用，拖动时设备会吸附到中心，方向键可微移设备（按住 Shift 键可加大步幅）。',
        'AI 智能体可以通过 MCP 服务器使用相同的布局（layoutPreset、textPosition）。',
      ],
    },
    'pt-br': {
      summary: 'Conheça o Storyframe: o gerador de capturas de tela ganhou nome, logo e cor própria, além de layouts prontos e posicionamento preciso.',
      notes: [
        'Novo nome e novo visual: Storyframe, porque as capturas de tela da App Store contam a história do seu app quadro a quadro. Com destaque em índigo, um novo ícone e um ícone na Tela de Início quando você adiciona o site ao seu celular.',
        'Os arquivos ZIP exportados levam o nome Storyframe, por exemplo Storyframe_iPhone_6.9_en-US.zip.',
        'Seis layouts para começar, mostrados como pré-visualizações ao vivo da sua tela: Clássico, Grande e marcante, Flutuante, Texto embaixo e Inclinado à esquerda e à direita para iPhone e iPad.',
        'O texto agora pode ficar abaixo do dispositivo. Dispositivos grandes sempre saem pela borda oposta ao texto, nunca por cima dele.',
        'Ajuste qualquer layout com precisão: posição, tamanho, inclinação, esquerda/direita e cima/baixo estão sempre à mão, o dispositivo se encaixa no centro ao ser arrastado e as setas do teclado o movem aos poucos (com Shift, em passos maiores).',
        'Agentes de IA podem usar os mesmos layouts pelo servidor MCP (layoutPreset, textPosition).',
      ],
    },
    nl: {
      summary: 'Maak kennis met Storyframe: de screenshotgenerator heeft een naam, een logo en een eigen kleur, plus kant-en-klare lay-outs en nauwkeurige plaatsing.',
      notes: [
        'Nieuwe naam en nieuw uiterlijk: Storyframe, omdat App Store-screenshots het verhaal van je app beeld voor beeld vertellen. Met indigo als accentkleur, een nieuw symbool en een symbool op het beginscherm als je de site aan je telefoon toevoegt.',
        'Geëxporteerde ZIP-bestanden dragen de naam Storyframe, bijvoorbeeld Storyframe_iPhone_6.9_en-US.zip.',
        'Zes lay-outs om mee te beginnen, als live voorvertoning van je scherm: Klassiek, Groot en krachtig, Zwevend, Tekst onder, en Naar links en Naar rechts gekanteld voor iPhone en iPad.',
        'Tekst kan nu ook onder het apparaat staan. Grote apparaten lopen altijd over de rand tegenover de tekst door, nooit de tekst in.',
        'Verfijn elke lay-out: positie, grootte, kanteling, links/rechts en omhoog/omlaag zijn altijd bij de hand, het apparaat klikt tijdens het slepen vast in het midden, en met de pijltoetsen schuif je het op (Shift voor grotere stappen).',
        'AI-agents kunnen dezelfde lay-outs gebruiken via de MCP-server (layoutPreset, textPosition).',
      ],
    },
    ko: {
      summary: 'Storyframe을 소개해요. 스크린샷 생성기에 이름과 로고, 고유한 색상이 생겼고, 바로 쓸 수 있는 레이아웃과 정밀한 배치 기능도 더해졌어요.',
      notes: [
        '새 이름과 새 모습: App Store 스크린샷은 앱의 이야기를 한 장면씩 들려주기 때문에 Storyframe이에요. 인디고 강조 색상과 새 아이콘을 적용했고, 페이지를 휴대폰에 추가하면 홈 화면 아이콘도 생겨요.',
        '내보낸 ZIP 파일에는 Storyframe 이름이 붙어요(예: Storyframe_iPhone_6.9_en-US.zip).',
        '시작점이 되는 레이아웃 6가지를 내 화면의 실시간 미리보기로 보여 줘요: 클래식, 크고 대담하게, 플로팅, 하단 텍스트, 그리고 iPhone과 iPad용 왼쪽으로 기울이기와 오른쪽으로 기울이기.',
        '이제 텍스트를 기기 아래에 둘 수 있어요. 큰 기기는 항상 텍스트 반대편 가장자리 밖으로 이어지고, 텍스트 쪽으로 넘어가지 않아요.',
        '어떤 레이아웃이든 세밀하게 조정할 수 있어요. 위치, 크기, 기울기, 좌우와 상하 이동을 언제든 바로 쓸 수 있고, 드래그하는 동안 기기가 가운데에 맞춰지며, 화살표 키로 조금씩 옮길 수 있어요(Shift를 누르면 더 크게 이동해요).',
        'AI 에이전트도 MCP 서버를 통해 같은 레이아웃을 쓸 수 있어요(layoutPreset, textPosition).',
      ],
    },
    ru: {
      summary: 'Встречай Storyframe: у генератора скриншотов появились имя, логотип и собственный цвет, а также готовые макеты и точное размещение.',
      notes: [
        'Новое имя и новый облик: Storyframe, ведь скриншоты в App Store рассказывают историю твоего приложения кадр за кадром. С акцентным цветом индиго, новой иконкой и иконкой для экрана «Домой», когда ты добавляешь страницу на телефон.',
        'Экспортированные ZIP-архивы называются по имени Storyframe, например Storyframe_iPhone_6.9_en-US.zip.',
        'Шесть макетов для старта в виде живого предпросмотра твоего экрана: «Классика», «Крупно», «Парящий», «Текст снизу», а также «Наклон влево» и «Наклон вправо» для iPhone и iPad.',
        'Текст теперь можно разместить под устройством. Крупные устройства всегда выходят за край напротив текста и никогда не заходят на него.',
        'Любой макет можно точно настроить: положение, размер, наклон, сдвиг влево/вправо и вверх/вниз всегда под рукой, при перетаскивании устройство прилипает к центру, а клавиши со стрелками сдвигают его (с Shift — крупными шагами).',
        'ИИ-агенты могут использовать те же макеты через MCP-сервер (layoutPreset, textPosition).',
      ],
    },
  },
  '1.11.0': {
    de: {
      summary: 'Einfachere Bedienung, mehr Geräte und mehr Hintergründe.',
      notes: [
        'Neue Geräte: iPhone Duo (aufgeklappt und zugeklappt), Mac und Apple Watch sowie die neuesten Rahmen für iPhone 18 Pro Max und iPad Pro M5.',
        'Einfacherer Inspektor: Tabs für Text, Hintergrund und Gerät in verständlicher Sprache, mit Textgrößen von S bis L und automatisch gut lesbaren Textfarben.',
        'Screenshots passen jetzt pixelgenau in jeden Rahmen: kein Hintergrund mehr in den Ecken (bisher auf dem iPad sichtbar) und keine Screenshot-Kanten außerhalb des Geräts.',
        'Das Gerät lässt sich auf der Arbeitsfläche verschieben.',
        '24 neue Verläufe, ausgewählt für App-Store-Screenshots, gegliedert in Lebhaft, Warm, Kühl, Sanft und Dunkel.',
        'Den Stil eines Bildschirms mit einem Klick auf alle Bildschirme übertragen.',
        '„Neuigkeiten“ zeigt den Versionsverlauf.',
      ],
    },
    fr: {
      summary: 'Des commandes plus simples, plus d’appareils et plus de fonds.',
      notes: [
        'Nouveaux appareils : iPhone Duo (ouvert et fermé), Mac et Apple Watch, ainsi que les derniers cadres pour iPhone 18 Pro Max et iPad Pro M5.',
        'Inspecteur simplifié : onglets Texte, Fond et Appareil dans un langage clair, avec des tailles de texte de S à L et des couleurs de texte automatiquement lisibles.',
        'Les captures d’écran s’adaptent désormais au pixel près à chaque cadre : plus de fond visible dans les coins (auparavant visible sur iPad) ni de bords de capture hors de l’appareil.',
        'Fais glisser l’appareil sur le canevas pour le déplacer.',
        '24 nouveaux dégradés choisis pour les captures d’écran de l’App Store, classés en Vifs, Chauds, Froids, Doux et Sombres.',
        'Applique le style d’un écran à tous les écrans en un clic.',
        '« Nouveautés » affiche l’historique des versions.',
      ],
    },
    es: {
      summary: 'Controles más sencillos, más dispositivos y más fondos.',
      notes: [
        'Nuevos dispositivos: iPhone Duo (abierto y cerrado), Mac y Apple Watch, además de los marcos más recientes de iPhone 18 Pro Max y iPad Pro M5.',
        'Inspector más sencillo: pestañas Texto, Fondo y Dispositivo con un lenguaje claro, tamaños de texto de S a L y colores de texto legibles automáticamente.',
        'Ahora las capturas de pantalla encajan al píxel en cada marco: ya no se ve el fondo en las esquinas (antes visible en el iPad) ni bordes de la captura fuera del dispositivo.',
        'Arrastra el dispositivo en el lienzo para moverlo.',
        '24 nuevos degradados elegidos para capturas de pantalla del App Store, organizados en Vivos, Cálidos, Fríos, Suaves y Oscuros.',
        'Aplica el estilo de una pantalla a todas las pantallas con un clic.',
        '«Novedades» muestra el historial de versiones.',
      ],
    },
    it: {
      summary: 'Controlli più semplici, più dispositivi e più sfondi.',
      notes: [
        'Nuovi dispositivi: iPhone Duo (aperto e chiuso), Mac e Apple Watch, oltre alle cornici più recenti di iPhone 18 Pro Max e iPad Pro M5.',
        'Ispettore più semplice: schede Testo, Sfondo e Dispositivo con un linguaggio chiaro, dimensioni del testo da S a L e colori del testo leggibili in automatico.',
        'Ora gli screenshot si adattano a ogni cornice al pixel: niente più sfondo visibile negli angoli (prima visibile su iPad) né bordi dello screenshot fuori dal dispositivo.',
        'Trascina il dispositivo nell’area di lavoro per spostarlo.',
        '24 nuove sfumature scelte per gli screenshot dell’App Store, organizzate in Vivaci, Caldi, Freddi, Tenui e Scuri.',
        'Applica lo stile di una schermata a tutte le schermate con un clic.',
        '“Novità” mostra la cronologia delle versioni.',
      ],
    },
    ja: {
      summary: 'よりシンプルな操作、より多くのデバイスと背景。',
      notes: [
        '新しいデバイス：iPhone Duo（開いた状態と閉じた状態）、Mac、Apple Watch に加え、最新の iPhone 18 Pro Max と iPad Pro M5 のフレーム。',
        'よりシンプルなインスペクタ：「テキスト」「背景」「デバイス」タブをわかりやすい言葉で表示。テキストサイズは S〜L から選べ、読みやすい文字色が自動で設定されます。',
        'スクリーンショットがすべてのフレームにピクセル単位でぴったり収まるようになりました。角から背景がのぞくこと（以前は iPad で発生）も、スクリーンショットの端がデバイスの外にはみ出すこともありません。',
        'キャンバス上でデバイスをドラッグして移動できます。',
        'App Store のスクリーンショット向けに厳選した24種類の新しいグラデーションを、「ビビッド」「ウォーム」「クール」「ソフト」「ダーク」に分類。',
        'ワンクリックで、ある画面のスタイルをすべての画面に適用できます。',
        '「新機能」でリリース履歴を確認できます。',
      ],
    },
    zh: {
      summary: '更简单的操作、更多设备和更多背景。',
      notes: [
        '新设备：iPhone Duo（展开和合上）、Mac 和 Apple Watch，以及最新的 iPhone 18 Pro Max 和 iPad Pro M5 边框。',
        '更简洁的检查器：“文字”“背景”“设备”标签页使用通俗易懂的语言，提供 S–L 文字大小，并自动选择易读的文字颜色。',
        '截图现在能像素级精准地贴合每个边框：角落不再露出背景（此前在 iPad 上可见），截图边缘也不会超出设备。',
        '在画布上拖动设备即可移动它。',
        '24 种专为 App Store 截图挑选的新渐变，分为鲜艳、暖色、冷色、柔和和深色。',
        '一键将某个页面的样式应用到所有页面。',
        '“新功能”会显示版本历史。',
      ],
    },
    'pt-br': {
      summary: 'Controles mais fáceis, mais dispositivos e mais fundos.',
      notes: [
        'Novos dispositivos: iPhone Duo (aberto e fechado), Mac e Apple Watch, além das molduras mais recentes do iPhone 18 Pro Max e do iPad Pro M5.',
        'Inspetor mais simples: abas Texto, Fundo e Dispositivo em linguagem clara, com tamanhos de texto de S a L e cores de texto legíveis automaticamente.',
        'As capturas de tela agora se encaixam com precisão de pixel em todas as molduras: nada de fundo aparecendo nos cantos (antes visível no iPad) nem bordas da captura fora do dispositivo.',
        'Arraste o dispositivo na área de trabalho para movê-lo.',
        '24 novos gradientes escolhidos para capturas da App Store, organizados em Vibrantes, Quentes, Frios, Suaves e Escuros.',
        'Aplique o estilo de uma tela a todas as telas com um clique.',
        '“Novidades” mostra o histórico de versões.',
      ],
    },
    nl: {
      summary: 'Eenvoudigere bediening, meer apparaten en meer achtergronden.',
      notes: [
        'Nieuwe apparaten: iPhone Duo (open en dicht), Mac en Apple Watch, plus de nieuwste kaders voor iPhone 18 Pro Max en iPad Pro M5.',
        'Eenvoudiger infovenster: tabbladen Tekst, Achtergrond en Apparaat in begrijpelijke taal, met tekstgroottes van S tot L en automatisch goed leesbare tekstkleuren.',
        'Screenshots passen nu pixelperfect in elk kader: geen achtergrond meer in de hoeken (eerder zichtbaar op iPad) en geen screenshotranden buiten het apparaat.',
        'Sleep het apparaat op het canvas om het te verplaatsen.',
        '24 nieuwe verlopen, gekozen voor App Store-screenshots, ingedeeld in Levendig, Warm, Koel, Zacht en Donker.',
        'Pas de stijl van een scherm met één klik toe op alle schermen.',
        '‘Wat is er nieuw’ toont de versiegeschiedenis.',
      ],
    },
    ko: {
      summary: '더 쉬운 조작, 더 많은 기기와 배경.',
      notes: [
        '새 기기: iPhone Duo(펼침 및 접힘), Mac, Apple Watch, 그리고 최신 iPhone 18 Pro Max와 iPad Pro M5 프레임.',
        '더 간단해진 속성 패널: 텍스트, 배경, 기기 탭을 알기 쉬운 말로 보여 주고, 텍스트 크기는 S~L 중에서 고를 수 있으며, 읽기 쉬운 텍스트 색상이 자동으로 적용돼요.',
        '이제 스크린샷이 모든 프레임에 픽셀 단위로 꼭 맞아요. 모서리로 배경이 비치거나(이전에는 iPad에서 보였어요) 스크린샷 가장자리가 기기 밖으로 삐져나오지 않아요.',
        '캔버스에서 기기를 드래그해 옮길 수 있어요.',
        'App Store 스크린샷에 맞게 고른 새 그라디언트 24가지를 비비드, 웜, 쿨, 소프트, 다크로 나눠 두었어요.',
        '클릭 한 번으로 한 화면의 스타일을 모든 화면에 적용할 수 있어요.',
        '\'새로운 기능\'에서 릴리스 기록을 볼 수 있어요.',
      ],
    },
    ru: {
      summary: 'Более простое управление, больше устройств и больше фонов.',
      notes: [
        'Новые устройства: iPhone Duo (открытый и закрытый), Mac и Apple Watch, а также рамки новейших iPhone 18 Pro Max и iPad Pro M5.',
        'Более простой инспектор: вкладки «Текст», «Фон» и «Устройство» с понятными названиями, размеры текста от S до L и автоматически подобранные читаемые цвета текста.',
        'Скриншоты теперь с точностью до пикселя вписываются в каждую рамку: в углах больше не виден фон (раньше это было заметно на iPad), а края скриншота не выходят за пределы устройства.',
        'Устройство можно перемещать по холсту перетаскиванием.',
        '24 новых градиента, подобранных для скриншотов App Store и разделённых на категории «Яркие», «Тёплые», «Холодные», «Мягкие» и «Тёмные».',
        'Стиль одного экрана можно применить ко всем экранам одним кликом.',
        '«Что нового» показывает историю версий.',
      ],
    },
  },
  '1.10.0': {
    de: {
      summary: 'Ein aufgeräumter Editor im Stil von Apple.',
      notes: [
        'Neu gestaltet im Stil einer nativen Mac-App: Systemschrift, gruppierte Karten, Segment-Steuerelemente und Schalter, im hellen und dunklen Modus.',
        'Ein klarerer Einstieg: Screenshots direkt auf der leeren Arbeitsfläche hochladen, mit Erklärung der drei Schritte.',
        'Der Export-Knopf sagt jetzt genau, was er enthält, zum Beispiel „iPhone & iPad · Alle Sprachen“.',
      ],
    },
    fr: {
      summary: 'Un éditeur plus épuré, dans le style d’Apple.',
      notes: [
        'Nouveau design dans le style d’une app Mac native : police système, cartes groupées, commandes segmentées et interrupteurs, en mode clair et sombre.',
        'Un démarrage plus clair : importe des captures d’écran directement depuis le canevas vide, avec les trois étapes expliquées.',
        'Le bouton d’export indique désormais exactement ce qu’il inclut, par exemple « iPhone & iPad · Toutes les langues ».',
      ],
    },
    es: {
      summary: 'Un editor más limpio, al estilo de Apple.',
      notes: [
        'Rediseñado al estilo de una app nativa de Mac: tipografía del sistema, tarjetas agrupadas, controles segmentados e interruptores, en modo claro y oscuro.',
        'Un comienzo más claro: sube capturas de pantalla directamente desde el lienzo vacío, con los tres pasos explicados.',
        'El botón de exportar ahora indica exactamente lo que incluye, por ejemplo «iPhone & iPad · Todos los idiomas».',
      ],
    },
    it: {
      summary: 'Un editor più pulito, in stile Apple.',
      notes: [
        'Riprogettato nello stile di un’app Mac nativa: font di sistema, riquadri raggruppati, controlli segmentati e interruttori, in modalità chiara e scura.',
        'Un inizio più chiaro: carica gli screenshot direttamente dall’area di lavoro vuota, con i tre passaggi spiegati.',
        'Il pulsante di esportazione ora indica esattamente cosa include, ad esempio “iPhone & iPad · Tutte le lingue”.',
      ],
    },
    ja: {
      summary: 'よりすっきりとした、Apple スタイルのエディタ。',
      notes: [
        'ネイティブの Mac アプリのスタイルで再デザイン：システムフォント、グループ化されたカード、セグメンテッドコントロール、スイッチを採用し、ライトモードとダークモードに対応。',
        'よりわかりやすい始め方：空のキャンバスから直接スクリーンショットをアップロードでき、3つのステップの説明も表示されます。',
        '書き出しボタンに、含まれる内容が正確に表示されるようになりました（例：「iPhone & iPad · すべての言語」）。',
      ],
    },
    zh: {
      summary: '更简洁的 Apple 风格编辑器。',
      notes: [
        '以原生 Mac App 的风格重新设计：系统字体、分组卡片、分段控件和开关，支持浅色和深色模式。',
        '更清晰的入门方式：直接在空白画布上传截图，并附有三个步骤的说明。',
        '导出按钮现在会准确显示所包含的内容，例如“iPhone & iPad · 所有语言”。',
      ],
    },
    'pt-br': {
      summary: 'Um editor mais limpo, no estilo da Apple.',
      notes: [
        'Redesenhado no estilo de um app nativo para Mac: fonte do sistema, cartões agrupados, controles segmentados e chaves, nos modos claro e escuro.',
        'Um começo mais claro: envie capturas de tela direto da área de trabalho vazia, com os três passos explicados.',
        'O botão de exportação agora diz exatamente o que inclui, por exemplo “iPhone e iPad · Todos os idiomas”.',
      ],
    },
    nl: {
      summary: 'Een overzichtelijke editor in Apple-stijl.',
      notes: [
        'Opnieuw ontworpen in de stijl van een native Mac-app: systeemlettertype, gegroepeerde kaarten, gesegmenteerde regelaars en schakelaars, in lichte en donkere modus.',
        'Een duidelijkere start: upload screenshots direct vanaf het lege canvas, met uitleg over de drie stappen.',
        'De exportknop zegt nu precies wat erin zit, bijvoorbeeld ‘iPhone & iPad · Alle talen’.',
      ],
    },
    ko: {
      summary: '더 깔끔한 Apple 스타일의 편집기.',
      notes: [
        '네이티브 Mac 앱 스타일로 새롭게 디자인했어요. 시스템 서체, 그룹으로 묶인 카드, 세그먼트 컨트롤과 스위치를 사용하고, 라이트 모드와 다크 모드를 지원해요.',
        '더 알기 쉬운 시작: 빈 캔버스에서 바로 스크린샷을 업로드할 수 있고, 세 단계도 설명해 드려요.',
        '이제 내보내기 버튼에 무엇이 포함되는지 정확히 표시돼요(예: "iPhone & iPad · 모든 언어").',
      ],
    },
    ru: {
      summary: 'Более аккуратный редактор в стиле Apple.',
      notes: [
        'Новый дизайн в стиле нативного приложения для Mac: системный шрифт, сгруппированные карточки, сегментированные элементы управления и переключатели — в светлом и тёмном режиме.',
        'Более понятное начало: загружай скриншоты прямо на пустой холст, с пояснением трёх шагов.',
        'Кнопка экспорта теперь точно показывает, что входит в экспорт, например «iPhone & iPad · Все языки».',
      ],
    },
  },
  '1.9.0': {
    de: {
      summary: 'KI-Agenten können deine Screenshots jetzt erstellen.',
      notes: [
        'MCP-Server: Claude, Cursor und andere KI-Agenten können gebrandete Screenshot-Sets erzeugen – gehostet unter screenshots.linkandreas.de/mcp oder lokal ausgeführt.',
        'Acht Schriften für Überschriften und Beschreibungen zur Auswahl.',
        'Neues Editor-Design und selbst gehostete Schriften.',
      ],
    },
    fr: {
      summary: 'Les agents d’IA peuvent désormais créer tes captures d’écran.',
      notes: [
        'Serveur MCP, hébergé sur screenshots.linkandreas.de/mcp ou exécuté localement : Claude, Cursor et d’autres agents d’IA peuvent générer des séries de captures d’écran à l’image de ta marque.',
        'Choisis parmi huit polices pour les titres et les descriptions.',
        'Nouveau design de l’éditeur et polices auto-hébergées.',
      ],
    },
    es: {
      summary: 'Ahora los agentes de IA pueden crear tus capturas de pantalla.',
      notes: [
        'Servidor MCP, alojado en screenshots.linkandreas.de/mcp o ejecutado localmente: Claude, Cursor y otros agentes de IA pueden generar series de capturas de pantalla con tu marca.',
        'Elige entre ocho tipografías para títulos y descripciones.',
        'Nuevo diseño del editor y fuentes autoalojadas.',
      ],
    },
    it: {
      summary: 'Ora gli agenti di IA possono creare i tuoi screenshot.',
      notes: [
        'Server MCP, ospitato su screenshots.linkandreas.de/mcp o eseguito in locale: Claude, Cursor e altri agenti di IA possono generare set di screenshot con il tuo brand.',
        'Scegli tra otto caratteri tipografici per titoli e descrizioni.',
        'Nuovo design dell’editor e font ospitati sul nostro server.',
      ],
    },
    ja: {
      summary: 'AI エージェントがスクリーンショットを作成できるようになりました。',
      notes: [
        'MCP サーバー：Claude、Cursor などの AI エージェントが、ブランドに合わせたスクリーンショットセットを生成できます。screenshots.linkandreas.de/mcp でホストされているものを使うほか、ローカルで実行することもできます。',
        '見出しと説明文に使える8種類の書体から選べます。',
        'エディタの新デザインと、セルフホストのフォント。',
      ],
    },
    zh: {
      summary: 'AI 智能体现在可以为你制作截图了。',
      notes: [
        'MCP 服务器：Claude、Cursor 和其他 AI 智能体可以生成带有品牌风格的整套截图，可使用托管在 screenshots.linkandreas.de/mcp 上的版本，也可在本地运行。',
        '可为标题和描述从八种字体中选择。',
        '全新的编辑器设计和自托管字体。',
      ],
    },
    'pt-br': {
      summary: 'Agentes de IA agora podem criar suas capturas de tela.',
      notes: [
        'Servidor MCP: Claude, Cursor e outros agentes de IA podem gerar conjuntos de capturas de tela com a sua marca, hospedados em screenshots.linkandreas.de/mcp ou executados localmente.',
        'Escolha entre oito fontes para títulos e descrições.',
        'Novo design do editor e fontes hospedadas no próprio servidor.',
      ],
    },
    nl: {
      summary: 'AI-agents kunnen nu je screenshots maken.',
      notes: [
        'MCP-server: Claude, Cursor en andere AI-agents kunnen screenshotsets in je eigen huisstijl genereren, gehost op screenshots.linkandreas.de/mcp of lokaal uitgevoerd.',
        'Kies uit acht lettertypen voor koppen en beschrijvingen.',
        'Nieuw editorontwerp en zelf gehoste lettertypen.',
      ],
    },
    ko: {
      summary: '이제 AI 에이전트가 스크린샷을 만들어 줄 수 있어요.',
      notes: [
        'MCP 서버: Claude, Cursor 등 AI 에이전트가 브랜드에 맞춘 스크린샷 세트를 렌더링할 수 있어요. screenshots.linkandreas.de/mcp에서 호스팅되는 서버를 쓰거나 로컬에서 실행할 수 있어요.',
        '헤드라인과 설명에 쓸 서체 8가지 중에서 고를 수 있어요.',
        '새로운 편집기 디자인과 자체 호스팅 서체.',
      ],
    },
    ru: {
      summary: 'Теперь ИИ-агенты могут создавать твои скриншоты.',
      notes: [
        'MCP-сервер: Claude, Cursor и другие ИИ-агенты могут создавать фирменные наборы скриншотов — на сервере screenshots.linkandreas.de/mcp или локально.',
        'Восемь шрифтов на выбор для заголовков и описаний.',
        'Новый дизайн редактора и шрифты на собственном сервере.',
      ],
    },
  },
  '1.8.0': {
    de: { notes: ['Die App läuft jetzt auf einem eigenen Server unter screenshots.linkandreas.de.'] },
    fr: { notes: ['L’app fonctionne désormais sur son propre serveur, à l’adresse screenshots.linkandreas.de.'] },
    es: { notes: ['La app ahora funciona en su propio servidor en screenshots.linkandreas.de.'] },
    it: { notes: ['L’app ora gira su un proprio server all’indirizzo screenshots.linkandreas.de.'] },
    ja: { notes: ['アプリが専用サーバー（screenshots.linkandreas.de）で動作するようになりました。'] },
    zh: { notes: ['应用现在运行在位于 screenshots.linkandreas.de 的独立服务器上。'] },
    'pt-br': {
      notes: [
        'O app agora funciona em um servidor próprio, em screenshots.linkandreas.de.',
      ],
    },
    nl: {
      notes: [
        'De app draait nu op een eigen server op screenshots.linkandreas.de.',
      ],
    },
    ko: {
      notes: [
        '이제 앱이 screenshots.linkandreas.de의 자체 서버에서 실행돼요.',
      ],
    },
    ru: {
      notes: [
        'Приложение теперь работает на собственном сервере по адресу screenshots.linkandreas.de.',
      ],
    },
  },
  '1.7.1': {
    de: { notes: ['Einen Absturz in Safari behoben.'] },
    fr: { notes: ['Correction d’un plantage dans Safari.'] },
    es: { notes: ['Se ha corregido un cierre inesperado en Safari.'] },
    it: { notes: ['Risolto un arresto anomalo in Safari.'] },
    ja: { notes: ['Safari でのクラッシュを修正しました。'] },
    zh: { notes: ['修复了 Safari 中的崩溃问题。'] },
    'pt-br': {
      notes: [
        'Correção de uma falha no Safari.',
      ],
    },
    nl: {
      notes: [
        'Een crash in Safari verholpen.',
      ],
    },
    ko: {
      notes: [
        'Safari에서 앱이 멈추던 문제를 고쳤어요.',
      ],
    },
    ru: {
      notes: [
        'Исправлен сбой в Safari.',
      ],
    },
  },
  '1.7.0': {
    de: { notes: ['Der Inspektor erklärt, was zu tun ist, wenn kein Bildschirm ausgewählt ist.'] },
    fr: { notes: ['L’inspecteur explique quoi faire lorsqu’aucun écran n’est sélectionné.'] },
    es: { notes: ['El inspector explica qué hacer cuando no hay ninguna pantalla seleccionada.'] },
    it: { notes: ['L’ispettore spiega cosa fare quando non è selezionata alcuna schermata.'] },
    ja: { notes: ['画面が選択されていないときに、何をすればよいかをインスペクタが説明します。'] },
    zh: { notes: ['未选择页面时，检查器会说明该怎么做。'] },
    'pt-br': {
      notes: [
        'O inspetor explica o que fazer quando nenhuma tela está selecionada.',
      ],
    },
    nl: {
      notes: [
        'Het infovenster legt uit wat je kunt doen als er geen scherm is gekozen.',
      ],
    },
    ko: {
      notes: [
        '선택한 화면이 없을 때 무엇을 하면 되는지 속성 패널에서 알려 줘요.',
      ],
    },
    ru: {
      notes: [
        'Инспектор подсказывает, что делать, если ни один экран не выбран.',
      ],
    },
  },
  '1.6.0': {
    de: { notes: ['Verständliche Fehlermeldungen, zum Beispiel wenn ein Screenshot die falsche Größe hat.'] },
    fr: { notes: ['Des messages d’erreur clairs, par exemple lorsqu’une capture d’écran n’a pas la bonne taille.'] },
    es: { notes: ['Mensajes de error claros, por ejemplo cuando una captura de pantalla tiene un tamaño incorrecto.'] },
    it: { notes: ['Messaggi di errore chiari, ad esempio quando uno screenshot ha le dimensioni sbagliate.'] },
    ja: { notes: ['スクリーンショットのサイズが正しくない場合などに、わかりやすいエラーメッセージを表示します。'] },
    zh: { notes: ['清晰的错误提示，例如截图尺寸不正确时。'] },
    'pt-br': {
      notes: [
        'Mensagens de erro claras, por exemplo quando uma captura de tela tem o tamanho errado.',
      ],
    },
    nl: {
      notes: [
        'Duidelijke foutmeldingen, bijvoorbeeld als een screenshot het verkeerde formaat heeft.',
      ],
    },
    ko: {
      notes: [
        '스크린샷 크기가 맞지 않을 때 등 오류 메시지를 알기 쉽게 보여 줘요.',
      ],
    },
    ru: {
      notes: [
        'Понятные сообщения об ошибках, например если у скриншота неправильный размер.',
      ],
    },
  },
  '1.5.1': {
    de: { notes: ['Die Bildschirmleiste am unteren Rand überarbeitet.'] },
    fr: { notes: ['Amélioration de la bande d’écrans en bas.'] },
    es: { notes: ['Se ha pulido la tira de pantallas de la parte inferior.'] },
    it: { notes: ['Rifinita la striscia delle schermate in basso.'] },
    ja: { notes: ['下部の画面一覧を改良しました。'] },
    zh: { notes: ['优化了底部的页面栏。'] },
    'pt-br': {
      notes: [
        'A faixa de telas na parte inferior foi aprimorada.',
      ],
    },
    nl: {
      notes: [
        'De schermenstrook onderaan verfijnd.',
      ],
    },
    ko: {
      notes: [
        '아래쪽 화면 목록을 다듬었어요.',
      ],
    },
    ru: {
      notes: [
        'Доработана полоса экранов внизу.',
      ],
    },
  },
  '1.5.0': {
    de: { notes: ['Bessere Darstellung auf Telefonen und Tablets.'] },
    fr: { notes: ['Meilleure mise en page sur les téléphones et les tablettes.'] },
    es: { notes: ['Mejor diseño en teléfonos y tabletas.'] },
    it: { notes: ['Layout migliorato su telefoni e tablet.'] },
    ja: { notes: ['スマートフォンとタブレットでの表示を改善しました。'] },
    zh: { notes: ['改进了在手机和平板电脑上的布局。'] },
    'pt-br': {
      notes: [
        'Layout melhor em celulares e tablets.',
      ],
    },
    nl: {
      notes: [
        'Betere lay-out op telefoons en tablets.',
      ],
    },
    ko: {
      notes: [
        '휴대폰과 태블릿에서 레이아웃이 더 좋아졌어요.',
      ],
    },
    ru: {
      notes: [
        'Улучшенный вид на телефонах и планшетах.',
      ],
    },
  },
  '1.4.0': {
    de: { notes: ['Ein einfacheres Export-Menü.'] },
    fr: { notes: ['Un menu d’export simplifié.'] },
    es: { notes: ['Un menú de exportación más sencillo.'] },
    it: { notes: ['Un menu di esportazione più semplice.'] },
    ja: { notes: ['書き出しメニューをシンプルにしました。'] },
    zh: { notes: ['更简洁的导出菜单。'] },
    'pt-br': {
      notes: [
        'Um menu de exportação mais simples.',
      ],
    },
    nl: {
      notes: [
        'Een eenvoudiger exportmenu.',
      ],
    },
    ko: {
      notes: [
        '내보내기 메뉴가 더 간단해졌어요.',
      ],
    },
    ru: {
      notes: [
        'Более простое меню экспорта.',
      ],
    },
  },
  '1.3.0': {
    de: { notes: ['Screenshots in mehreren Sprachen erstellen.', 'Eine kurze Einführung beim ersten Start.'] },
    fr: { notes: ['Crée des captures d’écran dans plusieurs langues.', 'Un court tutoriel pour les nouveaux utilisateurs.'] },
    es: { notes: ['Crea capturas de pantalla en varios idiomas.', 'Un breve tutorial para quienes usan la app por primera vez.'] },
    it: { notes: ['Crea screenshot in più lingue.', 'Un breve tutorial per chi la usa per la prima volta.'] },
    ja: { notes: ['複数の言語でスクリーンショットを作成できます。', '初めて使う方向けの簡単なチュートリアル。'] },
    zh: { notes: ['用多种语言制作截图。', '为首次使用的用户提供简短教程。'] },
    'pt-br': {
      notes: [
        'Crie capturas de tela em vários idiomas.',
        'Um breve tutorial para quem usa pela primeira vez.',
      ],
    },
    nl: {
      notes: [
        'Maak screenshots in meerdere talen.',
        'Een korte rondleiding voor nieuwe gebruikers.',
      ],
    },
    ko: {
      notes: [
        '여러 언어로 스크린샷을 만들 수 있어요.',
        '처음 사용하는 분을 위한 짧은 튜토리얼.',
      ],
    },
    ru: {
      notes: [
        'Создание скриншотов на нескольких языках.',
        'Короткое обучение при первом запуске.',
      ],
    },
  },
  '1.1.0': {
    de: { notes: ['Funktioniert auf Mobilgeräten.'] },
    fr: { notes: ['Fonctionne sur les appareils mobiles.'] },
    es: { notes: ['Funciona en dispositivos móviles.'] },
    it: { notes: ['Funziona sui dispositivi mobili.'] },
    ja: { notes: ['モバイルデバイスで動作します。'] },
    zh: { notes: ['支持移动设备。'] },
    'pt-br': {
      notes: [
        'Funciona em dispositivos móveis.',
      ],
    },
    nl: {
      notes: [
        'Werkt op mobiele apparaten.',
      ],
    },
    ko: {
      notes: [
        '모바일 기기에서도 작동해요.',
      ],
    },
    ru: {
      notes: [
        'Работает на мобильных устройствах.',
      ],
    },
  },
  '1.0.0': {
    de: {
      summary: 'Die erste Version.',
      notes: [
        'iPhone- und iPad-Screenshots mit Überschrift, Beschreibung und Hintergrund in einen Geräterahmen setzen.',
        'Vorlagen für Verläufe und Vollfarben, heller und dunkler Modus.',
        'Alle Bildschirme in App-Store-Auflösung als ZIP exportieren.',
      ],
    },
    fr: {
      summary: 'La première version.',
      notes: [
        'Place des captures d’écran iPhone et iPad dans un cadre d’appareil, avec un titre, une description et un fond.',
        'Préréglages de dégradés et de couleurs unies, mode clair et sombre.',
        'Exporte tous les écrans au format ZIP, en résolution App Store.',
      ],
    },
    es: {
      summary: 'La primera versión.',
      notes: [
        'Enmarca capturas de pantalla de iPhone y iPad con un título, una descripción y un fondo.',
        'Ajustes predefinidos de degradados y colores sólidos, modo claro y oscuro.',
        'Exporta todas las pantallas en un ZIP con la resolución del App Store.',
      ],
    },
    it: {
      summary: 'La prima versione.',
      notes: [
        'Inserisci gli screenshot di iPhone e iPad in una cornice con titolo, descrizione e sfondo.',
        'Preimpostazioni di sfumature e colori pieni, modalità chiara e scura.',
        'Esporta tutte le schermate in un file ZIP alla risoluzione dell’App Store.',
      ],
    },
    ja: {
      summary: '最初のリリース。',
      notes: [
        'iPhone と iPad のスクリーンショットを、見出し・説明文・背景付きでデバイスフレームに収められます。',
        'グラデーションと単色のプリセット、ライトモードとダークモード。',
        'すべての画面を App Store の解像度で ZIP に書き出せます。',
      ],
    },
    zh: {
      summary: '首个版本。',
      notes: [
        '为 iPhone 和 iPad 截图加上设备边框、标题、描述和背景。',
        '渐变和纯色预设，浅色和深色模式。',
        '以 App Store 分辨率将所有页面导出为 ZIP。',
      ],
    },
    'pt-br': {
      summary: 'A primeira versão.',
      notes: [
        'Coloque capturas de tela de iPhone e iPad em uma moldura, com título, descrição e fundo.',
        'Predefinições de gradiente e cor sólida, modos claro e escuro.',
        'Exporte todas as telas em um ZIP na resolução da App Store.',
      ],
    },
    nl: {
      summary: 'De eerste versie.',
      notes: [
        'Plaats iPhone- en iPad-screenshots in een kader met een kop, beschrijving en achtergrond.',
        'Voorinstellingen voor verlopen en effen kleuren, lichte en donkere modus.',
        'Exporteer alle schermen als ZIP in App Store-resolutie.',
      ],
    },
    ko: {
      summary: '첫 번째 릴리스.',
      notes: [
        'iPhone과 iPad 스크린샷을 헤드라인, 설명, 배경과 함께 기기 프레임에 넣을 수 있어요.',
        '그라디언트와 단색 프리셋, 라이트 모드와 다크 모드.',
        '모든 화면을 App Store 해상도로 ZIP 파일에 내보낼 수 있어요.',
      ],
    },
    ru: {
      summary: 'Первая версия.',
      notes: [
        'Скриншоты iPhone и iPad в рамке устройства с заголовком, описанием и фоном.',
        'Шаблоны градиентов и сплошных цветов, светлый и тёмный режим.',
        'Экспорт всех экранов в ZIP-архиве в разрешении App Store.',
      ],
    },
  },
};
