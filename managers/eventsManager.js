class eventsManager //менеджер обработки событий (для взаимодействия с пользователем) !!!ready!!!
{
    constructor()
    {
        this.bind = []; //сопоставление клавиш действиям
        this.action = []; //действия
    }

    setup() //настройка сопоставления
    {
        this.bind[87] = 'up'; //w- двигаться вверх
        this.bind[65] = 'left';// a - двигаться влево
        this.bind[83] = 'down';// s - двигаться вниз
        this.bind[68] = 'right'; // d - двигаться вправо
        this.bind[32] = 'fire'; //пробел - выстрелить

        document.body.addEventListener("keydown", this.onKeyDown); //контроль событий клавиатуры
        document.body.addEventListener("keyup", this.onKeyUp);

        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
    }

    onMouseDown = (event) => //при нажатии на клавишу мыши
    {
        this.action["fire"] = true;
        setTimeout(() => this.action["fire"] = false, 100); //отменили действие через 100 мсек
    }

    onMouseUp = (event) => //если ее отпустить (клавишу мыши)
    {
        this.action["fire"] = false;
    }

    onKeyDown = (event) => //нажали на кнопку на клавиатуре
    {
        let action = this.bind[event.keyCode];
        if (action && action !== 'fire')//проверили, есть ли сопоставление действию для события с кодом keyCode
        {
            this.action[action] = true; //согласились выполнить действие
        }
    }

    onKeyUp = (event) => //отпустили кнопку на клавиатуре
    {
        let action = this.bind[event.keyCode];
        if (action && action !== 'fire')//проверили, есть ли сопоставление действию для события с кодом keyCode
        {
            this.action[action] = false; //отменили действие
        }
        else
        {
            if (action === 'fire' ) //если действие - выстрел
            {
                this.action[action] = true; //выстрел
                setTimeout(() => this.action[action] = false, 100); //отменили действие через 100 мсек
            }
        }
    }

    kill()
    {
        document.body.removeEventListener("keydown", this.onKeyDown);
        document.body.removeEventListener("keyup", this.onKeyUp);

        canvas.removeEventListener("mousedown", this.onMouseDown);
        canvas.removeEventListener("mouseup", this.onMouseUp);
    }
}