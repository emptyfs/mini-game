var Entity = {
    pos_x: 0, //позиция объекта
    pos_y: 0,
    size_x: 0, //размеры объекта
    size_y: 0,
    extend: function (extendProto) //расширение сущности
    {
        let object = Object.create(this); //создание нового объекта
        for (let property in extendProto) //для всех свойств нового объекта
        {
            if (this.hasOwnProperty(property) || typeof object[property] === 'undefined')//чтобы нельзя было менять поля у родителя из потомка
            {//если нет в родительском - добавить
                object[property] = extendProto[property];
            }
        }
        return object;
    }
};

var Player = Entity.extend(
    {
        invulnerability: false,
        life: 3, //количество жизней
        speed: 10, //скорость передвижения
        move_x: 0, //направление движения
        move_y: 0,
        scores: 0, //количество очков
        damage: 1, //дамаг
        sprites: ['player1', 'player2'], //спрайты
        animCounter: 0, //счетчик кадров для анимации
        last_direct: {x: 1, y: 0}, //запоминает направление последнего выстрела

        draw: function () //прорисовка объекта
        {
            this.animCounter++;
            sprites_manager.drawSprite(this.sprites[this.animCounter % 2], this.pos_x, this.pos_y);
        },

        update: function () //обновление в цикле
        {
            physic_manager.update(this);
        },

        onTouchEntity: function (obj) //обработка встречи с препятствием
        {
            switch (obj.type)
            {
                case "Enemy":
                    if (!this.invulnerability)
                    {
                        this.life -= 1;
                        life.textContent = this.life;
                        sound_manager.play('./sound/player_take_damage.mp3');
                    }
                    if(this.life <= 0)
                    {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                    this.invulnerability = true;
                    setTimeout(() => {this.invulnerability = false}, 1000);
                    break;
                case "ArrowEnemy":
                    this.life -= 1;
                    life.textContent = this.life;
                    if(this.life <= 0)
                    {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                    else
                    {
                        sound_manager.play('./sound/player_take_damage.mp3');
                    }
                    break;

                case "Health":
                    this.life += 1;
                    life.textContent = this.life;
                    game_manager.kill(obj);
                    sound_manager.play('./sound/heal.mp3');
                    break;

                case "Gold":
                    this.scores += 100;
                    score.textContent = this.scores;
                    game_manager.kill(obj);
                    sound_manager.play('./sound/money.mp3');
                    break;
            }
        },

        fire: function () //выстрел
        {
            let r = Object.create(Arrow);
            sound_manager.play('./sound/shot.mp3'); //звук выстрела
            r.size_x = 10; //размеры объекта
            r.size_y = 10;
            r.name = "Arrow" + (++game_manager.bulNum); //используется счетчик выстрелов

            if(this.move_x === 0 && this.move_y === 0)
            {
                r.move_x = this.last_direct.x;
                r.move_y = this.last_direct.y;

                switch (r.move_x + 2 * r.move_y)
                {
                    case -1: //выстрел влево
                        r.pos_x = this.pos_x - r.size_x; //появится слева от игрока
                        r.pos_y = this.pos_y;
                        break;
                    case 1: //выстрел вправо
                        r.pos_x = this.pos_x + this.size_x; //появится справа от игрока
                        r.pos_y = this.pos_y;
                        break;
                    case -2:
                        r.pos_x = this.pos_x; //выстрел вверх
                        r.pos_y = this.pos_y - r.size_y;//появится сверху от игрока
                        break;
                    case 2: //выстрел вниз
                        r.pos_x = this.pos_x; //появится снизу от игрока
                        r.pos_y = this.pos_y + this.size_y;
                        break;
                    default:
                        return;
                }
            }
            else
            {
                r.move_x = this.move_x;
                r.move_y = this.move_y;

                switch (this.move_x + 2 * this.move_y)
                {
                    case -1: //выстрел влево
                        r.pos_x = this.pos_x - r.size_x; //появится слева от игрока
                        r.pos_y = this.pos_y;
                        this.last_direct.x = -1;
                        this.last_direct.y = 0;
                        break;
                    case 1: //выстрел вправо
                        r.pos_x = this.pos_x + this.size_x; //появится справа от игрока
                        r.pos_y = this.pos_y;
                        this.last_direct.x = 1;
                        this.last_direct.y = 0;
                        break;
                    case -2:
                        r.pos_x = this.pos_x; //выстрел вверх
                        r.pos_y = this.pos_y - r.size_y;//появится сверху от игрока
                        this.last_direct.x = 0;
                        this.last_direct.y = -1;
                        break;
                    case 2: //выстрел вниз
                        r.pos_x = this.pos_x; //появится снизу от игрока
                        r.pos_y = this.pos_y + this.size_y;
                        this.last_direct.x = 0;
                        this.last_direct.y = 1;
                        break;
                    default:
                        return;
                }
            }
            game_manager.entities.push(r);
        }
    });

var Enemy = Entity.extend({
    life: 3, //жизни
    move_x: 0, //направление движения
    move_y: 0,
    speed: 2, //скорость
    directionCounter: 29, //время движение по одному из направлений
    animCounter: 0, //счетчик кадров для анимации
    sprites: ['bat_walk1', 'bat_walk2'], //спрайты

    randomDirection: function()
    {//рандомное движение
        switch (Math.floor(Math.random() * (Math.floor(4) - Math.ceil(0))) + Math.ceil(0))
        {
            case 0:
                this.move_x = 1;
                this.move_y = 0;
                break;
            case 1:
                this.move_x = -1;
                this.move_y = 0;
                break;
            case 2:
                this.move_y = 1;
                this.move_x = 0;
                break;
            case 3:
                this.move_y = -1;
                this.move_x = 0;
                break;
        }
    },

    draw: function ()
    {//прорисовка объекта
        this.animCounter++;
        sprites_manager.drawSprite(this.sprites[this.animCounter % 2], this.pos_x, this.pos_y);
        this.directionCounter++;

        if (this.directionCounter === 30) //при 30 меняем направление движения
        {
            this.directionCounter = 0;
            this.randomDirection();
        }
        if(this.directionCounter % 15 === 0)//при 15 или 30 стреяем
        {
            this.fire();
            sound_manager.play("./sound/shot.mp3");
        }
    },

    update: function()
    {//обновление в цикле
        physic_manager.update(this);
    },

    onTouchEntity: function (obj)
    {//обработка встречи с препятствием
        switch (obj.type)
        {
            case "Arrow":
                this.life -= game_manager.player.damage;
                sound_manager.play('./sound/enemy_death.mp3');
                if(this.life === 0)
                {
                    if(level_number === 2)
                    {
                        game_manager.enemy_count--;
                        document.querySelector("#is_kill").innerHTML = `Врагов осталось: ${game_manager.enemy_count}`;
                        if (game_manager.enemy_count === 0)
                        {
                            document.querySelector("#is_kill").innerHTML = "";
                            document.querySelector("#kill_all").innerHTML = `Молодец!<br> Теперь можешь<br> закончить уровень`;
                        }
                    }
                    game_manager.kill(this);
                    game_manager.player.scores  += 200;
                    score.textContent = game_manager.player.scores;
                    sound_manager.play('./sound/enemy_take_damage.mp3');
                }
                break;
            default:
                this.randomDirection();
        }
    },

    onTouchMap: function()
    {
        this.randomDirection();
    },

    fire: function () //выстрел
    {
        const r = Object.create(Arrow);
        r.size_x = 10;
        r.size_y = 10;
        r.name = "Arrow" + (++game_manager.bulNum);
        r.move_x = this.move_x;
        r.move_y = this.move_y;
        r.type = "ArrowEnemy";
        switch (this.move_x + 2 * this.move_y) {
            case -1:
                r.pos_x = this.pos_x - r.size_x;
                r.pos_y = this.pos_y;
                break;
            case 1:
                r.pos_x = this.pos_x + this.size_x;
                r.pos_y = this.pos_y;
                break;
            case -2:
                r.pos_x = this.pos_x;
                r.pos_y = this.pos_y - r.size_y;
                break;
            case 2:
                r.pos_x = this.pos_x;
                r.pos_y = this.pos_y + this.size_y;
                break;
            default:
                return;
        }
        game_manager.entities.push(r);
    }
});

var Arrow = Entity.extend({
    move_x: 0, //направление движения
    move_y: 0,
    speed: 20, //скорость
    type: 'Arrow', //тип объекта

    draw: function () //отрисовка
    {
        if(this.move_x === 1)
        {
            sprites_manager.drawSprite(`bullet_right`, this.pos_x, this.pos_y);
        }
        else if (this.move_x === -1)
        {
            sprites_manager.drawSprite(`bullet_left`, this.pos_x, this.pos_y);
        }
        else if (this.move_y === 1)
        {
            sprites_manager.drawSprite(`bullet_down`, this.pos_x, this.pos_y);
        }
        else if (this.move_y === -1)
        {
            sprites_manager.drawSprite(`bullet_up`, this.pos_x, this.pos_y);
        }
    },

    update: function ()  //обновление в цикле
    {
        physic_manager.update(this);
    },

    onTouchMap: function () //обработка встречи
    {
        game_manager.kill(this);
    },

    onTouchEntity: function (obj) //обработка встречи
    {
        switch (obj.type) {
            case "Enemy":
                obj.onTouchEntity(this);
                game_manager.kill(this);
                break;
            case "Player":
                obj.onTouchEntity(this);
                game_manager.kill(this);
                break;
            default:
                game_manager.kill(this);
        }
    },

});

var Gold = Entity.extend(
    {
        draw: function ()
        {
            sprites_manager.drawSprite("gold", this.pos_x, this.pos_y);
        },
        update: () => {}
    });


var Health = Entity.extend({
    draw: function ()
    {
        sprites_manager.drawSprite("health", this.pos_x, this.pos_y);
    },
    update: () => {}
});