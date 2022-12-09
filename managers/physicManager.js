let get_records = (name, score) =>
{
    let records = new Map(JSON.parse(localStorage.getItem("records"))); //map с рекордами

    if (records.has(name) && records.get(name) < score)  //если в таблице есть имя и рекорд меньше - обновляем
    {
        records.set(name, score);
    }

    else //если имени нет - закидываем имя
    {
        records.set(name, score);
    }

    records = [...records.entries()].sort((a, b) => b[1] - a[1]); //сортируем таблицу
    localStorage.setItem("records", JSON.stringify(records)); //кидаем в локальное хранилище обновленную таблицу
    return records; //возвращаем таблицу
}

let update_records = (score) =>
{
    let name = localStorage.getItem('username'); //достаем из локального хранилища никнейм
    let records = get_records(name, score); //функция, которая обновляет таблицу рекордов и возвращает ее

    let temp = document.querySelector('#records');

    records.forEach((element, index) =>
    {
        temp.insertAdjacentHTML('beforeend',`<h1>${index}. ${element[0]} - ${element[1]}<\h1>`)
    });

    document.querySelector("#seen").style.display = 'none';
    document.querySelector('#records').hidden = false;
};

class PhysicManager
{

    constructor()
    {
        this.check_death = false;
    }

    update(obj) //обновление состояний объектов
    {
        if (obj.type === "Player" && obj.life === 0 && !this.check_death)
        {
            this.check_death = true;
            sound_manager.play('./sound/player_death.mp3');
            setTimeout(() => sound_manager.stopAll(), 4000);
            //document.querySelector("#seen").style.display = "none";
            setTimeout(() => window.location.replace("./game_over.html"), 1000);
        }


        let newX = obj.pos_x + Math.floor(obj.move_x * (obj.speed)); //новые координаты объекта
        let newY = obj.pos_y + Math.floor(obj.move_y * (obj.speed));


        let ts;

        if (obj.move_x === -1)
        {
            ts = map.getTilesetIdx(newX + (obj.size_x) / 2 - 10, newY + (obj.size_y) / 2 );
        }
        else
        {
            ts = map.getTilesetIdx(newX + (obj.size_x) / 2, newY + (obj.size_y) / 2 );
        }

        let e = this.entityAtXY(obj, newX, newY);

        if (e !== null && obj.onTouchEntity) //взаимодействия объектов
        {
            obj.onTouchEntity(e);
        }

        if (ts[0] === 55 && obj.type === "Player" && level_number === 1)
        {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            Player.scores = game_manager.player.scores;
            Player.life = game_manager.player.life;
            Player.damage = game_manager.player.damage;
            event_manager.kill();
            event_manager = new eventsManager();
            sound_manager.play('./sound/win.mp3');
            clearInterval(interval);
            game_manager = new gameManager('./json/level2.json');
            return "";
        }

        if (ts[0] === 52 && obj.type === "Player" && level_number === 2)
        {
            if (game_manager.enemy_count > 0)
            {
                sound_manager.play("./sound/attention.mp3");
                document.querySelector("#kill_all").innerHTML = "Убей всех врагов";
                document.querySelector("#is_kill").innerHTML = `Врагов осталось: ${game_manager.enemy_count}`;
            }
            else
            {
                sound_manager.play('./sound/win.mp3');
                setTimeout(() => sound_manager.stopAll(), 3000);
                update_records(game_manager.player.scores);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clearInterval(interval);
                return "";
            }
        }

        if ((((ts[0] !== 57) && level_number === 1) || ((ts[0] === 497 || ts[1] !== 0 || ts[0] === 48 || ts[0] === 117
        || ts[0] === 73 || ts[0] === 26 || ts[0] === 28 || ts[0] === 52 || ts[0] === 143 || ts[0] === 71) && level_number === 2)) && obj.onTouchMap) //есть препятствие
        {
            obj.onTouchMap(ts); //разбор конфликта с препятствием
        }

        if (((ts[0] === 57) || (ts[0] === 138) || (ts[0] === 169) || (ts[0] === 150)
            || (ts[0] === 83) || (ts[0] === 174) || (ts[0] === 52)) && e === null)//перемещаем объект на свободное место
        {
            obj.pos_x = newX;
            obj.pos_y = newY;
        }
        else
        {
            return "break"; //дальше двигаться нельзя
        }
        return "move"; //двигаемся
    }

    entityAtXY(obj, x, y) //поиск объекта по координатам !!!ready!!!
    {//объект и его координаты
        for (let i = 0; i < game_manager.entities.length; i++)
        {
            let e = game_manager.entities[i]; //все объекты карты
            if (e.name !== obj.name)  //имя не совпадает
            {
                if (x + obj.size_x < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x || y > e.pos_y + e.size_y)
                {//не пересикаются
                    continue;
                }
                return e;//найден объект
            }
        }
        return null; //объект не найден
    }
}