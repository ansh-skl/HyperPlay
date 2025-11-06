// Add your games here 👇
const games = [
  {
    title: "Shooter Game",
    img: "https://via.placeholder.com/300x200?text=Shooter+Game",
    file: "shooter/index.html"
  },
  {
    title: "Road Rivals",
    img: "https://via.placeholder.com/300x200?text=Racing+Game",
    file: "roadrivals/index.html"
  },
  {
    title: "Puzzle Game",
    img: "https://via.placeholder.com/300x200?text=Puzzle+Game",
    file: "puzzle/index.html"
  }
];

// Create cards for each game
const container = document.getElementById('game-list');
games.forEach(game => {
  const card = document.createElement('div');
  card.classList.add('game-card');
  card.innerHTML = `
    <img src="${game.img}" alt="${game.title}">
    <h3>${game.title}</h3>
  `;
  card.addEventListener('click', () => {
    window.location.href = `game.html?src=${encodeURIComponent(game.file)}&title=${encodeURIComponent(game.title)}`;
  });
  container.appendChild(card);
});
