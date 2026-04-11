const bezels = import.meta.glob('/public/Bezels/**/*.png', { eager: true });
console.log(Object.keys(bezels));
