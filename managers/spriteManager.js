class spriteManager //менеджер обработки атласа (спрайтов объектов на карте) !!!ready!!!
{
    constructor()
    {
        this.image = new Image(); //рисунок с объектами
        this.sprites = []; //массив объектов для отображения
        this.imgLoaded = false; //изображения загружены
        this.jsonLoaded = false; //JSON загружен
    }

    loadAtlas(atlasJson, atlasImg) //загрузка атласа изображений !!!ready!!!
    {//параметры - путь к файлу атласа (json) и изображение
        let request = new XMLHttpRequest(); //подготовить запрос на разбор атласа
        request.onreadystatechange = () =>
        {
            if (request.readyState === 4 && request.status === 200)
            {//успешно получили атлас
                this.parseAtlas(request.responseText);
            }
        };
        request.open("GET", atlasJson, true);//асинхронный запрос на разбор атласа
        request.send(); //отправили запрос
        this.loadImg(atlasImg); //загрузка изображения
    }

    loadImg(imgName) //функция загрузки изображения менеджера спрайтов !!!ready!!!
    {//параметр - путь к изображению
        this.image.onload = () =>
        {//когда изображение загружено - установить в true
            this.imgLoaded = true;
        };
        this.image.src = imgName;//давайте загрузим изображение
    }

    parseAtlas(atlasJSON) //разобрать атлас с объектами !!!ready!!!
    {
        let atlas = JSON.parse(atlasJSON);
        for (let name in atlas.frames)//проход по всем именам в frames
        {
            let frame = atlas.frames[name].frame;//получение спрайта и
            //сохранение его в frame
            this.sprites.push({name: name, x: frame.x, y: frame.y,
                w: frame.w, h: frame.h});//сохранение характеристик frame в виде объекта
        }
        this.jsonLoaded = true; //когда разобрали весь атлас - true
    }

    drawSprite(name, x, y) //функция отображения спрайтов !!!ready!!!
    {//имя спрайта, координаты
        if (!this.imgLoaded || !this.jsonLoaded)
        {//если изображение не загружено, то повторить запрос через 100мсек
            setTimeout(() => {this.drawSprite(name, x, y);}, 100);
        }
        else
        {
            let sprite = this.getSprite(name); //получить спрайт по имени

            if (!map.isVisible(x, y, sprite.w, sprite.h))
            {
                return;   //не рисуем за пределами видимой зоны
            }

            //x -= map.view.x; //сдвигаем видимую зону
            //y -= map.view.y;

            ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w,
                sprite.h, x, y, sprite.w, sprite.h);//отображение спрайта на холсте
        }
    }

    getSprite(name) //получение спрайта по имени !!!ready!!!
    {
        for (let i = 0; i < this.sprites.length; i++)
        {
            let s = this.sprites[i];
            if (s.name === name) //если совпало - вернуть объект
            {
                return s;
            }
        }
        return null;//не нашли
    }
}