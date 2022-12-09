class mapManager //менеджер обработки карты !!!ready!!!
{
    constructor(data) //в конструтор передается json-файл карты !!!ready!!!
    {//извлекаем ифнормацию из json
        this.mapData = data; //хранит карту
        this.tLayer = null; //ссылка на блоки карты
        this.xCount = this.mapData.width; //количество блоков по горизонтали
        this.yCount = this.mapData.height; //количество блоков по вертикали

        this.tSize =
            {//размеры блока
                x: this.mapData.tilewidth,
                y: this.mapData.tileheight
            };

        this.mapSize =
            {//размер карты
                x: this.xCount * this.tSize.x,
                y: this.yCount * this.tSize.y
            };

        this.tilesets = []; //массив описаний блоков карты
        this.imgLoadCount = 0; //количество подгруженных фото
        this.imgLoaded = false; //проверяет, загружены ли фото
        this.jsonLoaded = false; //проверяет, загружено ли описание json
        this.view = {x: 0, y: 0, w:640, h:475}; //видимая область с координатами левого верхнего угла

        for (let i = 0; i < this.mapData.tilesets.length; i++)//загрузка изображений
        {//по сути перенес в конструктор функцию parseMap с.31
            let img = new Image(); //создаем переменную для хранения изображений
            img.onload = () => //при загрузке изображения
            {
                this.imgLoadCount++; //увеличиваем счетчик изображений
                if (this.imgLoadCount === this.mapData.tilesets.length)
                {
                    this.imgLoaded = true; //загружены все изображения
                }
            }
            img.src = this.mapData.tilesets[i].image; //задание пути к изображению
            let t = this.mapData.tilesets[i]; //забираем tileset из карты
            let ts =
                {//создаем свой объект tileset
                    firstgid: t.firstgid, //с firstgid начинается нуиерация в data
                    image: img, //объект рисунка
                    name: t.name, //имя элемента рисунка
                    xCount: Math.floor(t.imagewidth / this.tSize.x), //горизонталь
                    yCount: Math.floor(t.imageheight / this.tSize.y), //вертикаль
                    type: t.type //тип элемента
                }
            this.tilesets.push(ts); //сохраняем tileset в массив
        }
        this.jsonLoaded = true; //разобрали весь json-файл
    }

    draw() //отрисовка карты в контексте !!!ready!!!
    {
        if (!this.imgLoaded || !this.jsonLoaded)
        {
            setTimeout(() => {this.draw();}, 100);
        }

        else
        {
            if(this.tLayer === null)//проверить, что tLayer настроен
            {
                //проходим фильтром по всем layer карты и
                //в tLayer кидаем массив layers с типом tilelayer
                this.tLayer = this.mapData.layers.filter(item => item.type === "tilelayer");
                //создаёт новый массив со всеми элементами, прошедшими проверку, задаваемую в передаваемой функции (type = tilelayer)
            }

            else
            {
                //проходим по всей карте
                this.tLayer.forEach(element1 => {element1.data.forEach((element2, i) =>
                    {
                        if (element2 !== 0) //если нет данных - пропускаем
                        {
                            let tile = this.getTile(element2); //получение блока по индексу
                            let pX = (i % this.xCount) * this.tSize.x; //вычисляем x в пикселях
                            let pY = Math.floor(i / this.xCount) * this.tSize.y; //y
                            //if (this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                            //{//не рисуем за пределами видимой зоны + сдвигаем видимую зону
                                //pX -= this.view.x;
                                //pY -= this.view.y;
                                //рисуем контекст
                                ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x,
                                    this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                                //изображение, координаты блока в изображении, ширина и высота блока в изображении
                                //координаты, где необходимо блок отобразить
                            //}
                        }
                    });
                })
            }
        }
    }

    getTile(tileIndex) // блока по индексу из tilesets !!!ready!!!
    {
        let tile =
            {
                img: null, //изображение tileset
                px: 0, //координаты блока в tileset
                py: 0
            };
        let tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;//изображение искомого tileset
        let id = tileIndex - tileset.firstgid;//индекс блока в tileset
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile; //блок для отображения
    }

    getTileset(tileIndex) //получение блока по индексу (вспомогательная функция для функции выше) !!!ready!!!
    {
        for (let i = this.tilesets.length - 1; i >= 0; i--)
        {
            //в каждом tilesets[i] записано число
            //с которого начинается нумеация блоков
            if (this.tilesets[i].firstgid <= tileIndex)
            {//если индекс первого блока меньше либо равен искомому
                return this.tilesets[i];
            }
        }
        return null;
    }


    isVisible(x, y, width, height) //!!!ready!!!
    //в случае, если карта на холсте не помещается
    {
        return !(x + width < this.view.x || x > this.view.x + this.view.w || y + height < this.view.y || y > this.view.y + this.view.h);
    }

    parseEntities() //разбор слоя типа objectgroup //!!!ready!!!
    {
        if (!this.imgLoaded || !this.jsonLoaded)
        {
            setTimeout(() => {this.parseEntities();}, 100);
        }
        else
        {
            for (let j = 0; j < this.mapData.layers.length; j++)
            {//просмотр всех слоев
                if (this.mapData.layers[j].type === 'objectgroup')
                {//слой с объектами следует "разобрать"
                    let entities = this.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++)
                    {
                        let e = entities.objects[i];
                        try
                        {
                            let obj = Object.create(game_manager.factory[e.type]);
                            //в соответсвии с типом создаем экземпляр объекта
                            obj.name = e.name;
                            obj.type = e.type;

                            if (obj.type === "Enemy")
                            {
                                game_manager.enemy_count++;
                            }

                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            //помещаем в массив обхектов
                            game_manager.entities.push(obj);
                            if (obj.name === 'Player')
                            {
                                //инициализируем параметр игрока
                                game_manager.initPlayer(obj);
                            }
                        }
                        catch (ex)
                        {
                            //console.log("Error while creating: [" + e.gid + "]" + e.type + " " + ex); //сообщаем об ошибке
                        }
                    }
                }
            }
        }
    }

    getTilesetIdx(x, y) //используя tSize.x, tSize.y (размеры блоков) !!!ready!!!
    //и xCount (количество блоков по горизонтали) - вычисляет индекс блока в массиве data(idx)
    {
        let idx = Math.floor(y / this.tSize.y) * this.xCount +
            Math.floor(x / this.tSize.x);
        return [this.tLayer[0].data[idx], this.tLayer[1].data[idx]];
    }

    centerAt(x, y) //центрирование области mapManager.view относительно положения игрока !!!ready!!!
    {
        if (x < this.view.w / 2)//центрирование по горизонтали
        {
            this.view.x = 0;
        }
        else
        {
            if (x > this.mapSize.x - this.view.w / 2)
            {
                this.view.x = this.mapSize.x - this.view.w;
            }
            else
            {
                this.view.x = x - (this.view.w / 2);
            }
        }
        if (y < this.view.h / 2) //центрирование по вертикали
        {
            this.view.y = 0;
        }
        else
        {
            if (y > this.mapSize.y - this.view.h / 2)
            {
                this.view.y = this.mapSize.y - this.view.h;
            }
            else
            {
                this.view.y = y - (this.view.h / 2);
            }
        }
    }
}