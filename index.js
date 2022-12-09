const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.querySelector("#score").innerHTML = `${Player.scores}`;
let score = document.querySelector("#score");

document.querySelector("#life").innerHTML = `${Player.life}`;
let life = document.querySelector("#life");

let level_number = 0;
let game_manager;
let map;
let interval;
let sprites_manager = new spriteManager();
let event_manager = new eventsManager();
let physic_manager = new PhysicManager();
let sound_manager = new SoundManager();

sound_manager.loadArray(['./sound/attention.mp3','./sound/enemy_take_damage.mp3','./sound/background.mp3', './sound/player_death.mp3','./sound/win.mp3', './sound/shot.mp3', './sound/enemy_death.mp3', './sound/player_take_damage.mp3', './sound/heal.mp3', './sound/money.mp3']);
let form = document.querySelector('#name');
let input = document.querySelector('input');

form.addEventListener('submit', e =>
{
    e.preventDefault();
    document.querySelector('#info').hidden = false;
    document.querySelector('#canvas').hidden = false;
    localStorage.setItem('username', input.value);
    document.querySelector("#start_game").style.display = 'none';
    sound_manager.play('./sound/background.mp3', { looping: true, volume: 1 });
    game_manager = new gameManager('./json/level1.json');
});