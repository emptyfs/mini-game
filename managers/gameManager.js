async function loadMap(path) //!!!ready!!!
{//получаем карту с помощью get-запроса (в методе с.29, но там
    //создавали отдельную функцию для парсинга, я решил в конструкторе класса карты это сделать)
    let data = await fetch(path, {method: 'GET'});
    return await data.json();
}

class gameManager //менеджер игры
{
    constructor(path)
    {
        this.bulNum = 0;
        this.factory = {}; //фабрика объектов на карте
        this.entities = []; //объекты на карте
        //this.fireNum: 0; //идентификатор выстрела
        this.player = null; //указатель на объект игрока
        this.laterKill = []; //отложенное уничтожение объектов
        this.enemy_count = 0;

        loadMap(path).then((data) => //для корректной работы всех менеджеров игры (последовательная инициализация)
        {
            map = new mapManager(data); //загрузка карты
            sprites_manager.loadAtlas("./img/sprites/spritesheet.json", "./img/sprites/spritesheet.png"); //загрузка атласа

            this.factory['Player'] = Player; //инициализация фабрики
            this.factory['Enemy'] = Enemy;
            this.factory['Gold'] = Gold;
            this.factory['Health'] = Health;

            map.parseEntities(); //разбор сущностей карты
            map.draw(); //отобразить карту
            level_number++; //лвл
            event_manager.setup();//настройка событий
            this.play();
        });
    }

    initPlayer(obj) //инициализация игрока
    {
        this.player = obj;
    }

    kill(obj)
    {
        this.laterKill.push(obj);
    }

    draw() //функция отображения игрового поля пользователю
    {
        for (let e = 0; e < this.entities.length; e++)
        {//цикль по всем объектам карты
            this.entities[e].draw();
        }
    }

    update() //обновление информации
    {
        if (this.player === null)
        {
            return;
        }

        //по умолчанию игрок никуда не двигается
        this.player.move_x = 0;
        this.player.move_y = 0;


        //поймали событие - обрабатываем
        if (event_manager.action["up"])
        {
            this.player.move_y = -1;
        }

        if (event_manager.action["down"])
        {
            this.player.move_y = 1;
        }

        if (event_manager.action["left"])
        {
            this.player.move_x = -1;
        }

        if (event_manager.action["right"])
        {
            this.player.move_x = 1;
        }

        //стреляем
        if (event_manager.action["fire"])
        {
            this.player.fire();
        }

        //обновление информации по всем объектам на крте
        this.entities.forEach((e) =>
            {
                try//защита от ошибок при выполнении update
                {
                    e.update();
                }
                catch (ex)
                {
                    console.log(e, ex);
                }
            });

        //удаление всех объектов, попавших в laterKill
        for (let i = 0; i < this.laterKill.length; i++)
        {
            let idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1)
            {
                this.entities.splice(idx, 1); //удаление из массива 1 объект
            }
        }

        if (this.laterKill.length > 0) //очистка массива laterKill
        {
            this.laterKill.length = 0;
        }

        map.draw();
        map.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw();
    }

    play() //начать исполнение игры
    {
        interval = setInterval(() => this.update(), 100);
    }
}