class SoundManager //менеджер звука
{
    constructor()
    {
        this.clips = {}; //звуковые эффекты//хранение аудио по имени//ключ - имя файла
        this.context = new AudioContext(); //аудиоконтекст
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode(); //главный узел//громкость звука
        this.loaded = false; //все звуки загружены
        this.gainNode.connect(this.context.destination); //подключение к динамикам
    }

    load(path, callback) //загрузка одного аудиофайла
    {//путь до загружаемого аудиофайла и функциия при успешном выполнении
        if (this.clips[path]) //проверяем, что уже загружены
        {
            callback(this.clips[path]); //вызываем загруженный
            return; //выход
        }

        let clip = {path: path, buffer: null, loaded: false };//клип, буфер, загружен

        let temp = this;

        clip.play = function (volume, loop)
        {//громкость и признак зацикленности
            temp.play(this.path, {looping: loop ? loop : false, volume: volume ? volume : 1});//если параметры в
            //функцию не переданы - проиграть один раз на 100% громкости
        };

        this.clips[path] = clip; //помещаем в "массив" клипов, ключ - путь до аудиофайла

        let request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = 'arraybuffer';
        request.onload = () =>
        {
            this.context.decodeAudioData(request.response, function (buffer)
            {//buffer - загруженный поток байт, loaded - клип загружен
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };
        request.send();
    }

    loadArray(array)  //множество аудиофайлов//загрузить массив звуков
    {
        for (let i = 0; i < array.length; i++)
        {//для каждого элемента массива выполняется функция загрузки load
            this.load(array[i], () =>
            {//путь до файла и callback-функция
                if (array.length === Object.keys(this.clips).length)//проверяется, что длина массива равна количеству клипов для загрузки
                {//если подготовоили для загрузки все звуки
                    for (let sd in this.clips)//цикл по всем клипам из поля clips менеджера звуков
                    {
                        if (this.clips[sd].loaded)
                        {
                            return;
                        }
                    }
                    this.loaded = true; //все звуки загружены
                }
            });
        }
    }

    play(path, settings) //проигрывание аудиофайла
    {//путь до аудиофайла и параметры звука
        if (this.loaded) //если еше все не загрузили
        {//проверяет, загружены ли звуки, если нет, то вызов повторяется через 1000мсек
            setTimeout(() => {this.play(path, settings);}, 1000);
            return;
        }

        let looping = false;//значения по умолчанию (проигрывание в цикле)
        let volume = 1; //(громкость)

        if (settings) //если переопределены, то перенастраиваем значения
        {//если существует переменная settings.looping, то ее значение сохраняется в looping
            if (settings.looping)
            {
                looping = settings.looping;
            }

            //по аналогии с looping
            if (settings.volume)
            {
                volume = settings.volume;
            }
        }

        let sd = this.clips[path]; //получаем звковой эффект

        if (sd === null)
        {
            return false;
        }

        let sound =this.context.createBufferSource(); //создаем новый экземпляп проигрывателя BufferSource
        //создается источник звука
        sound.buffer = sd.buffer;//настраивается буфер
        sound.connect(this.gainNode);//подключение источника к "колонкам"
        sound.loop = looping;//повторять
        this.gainNode.gain.value = volume;//громкость звука
        sound.start(0);//проигрывание звука
        return true;
    }

    stopAll() //выключить звук
    {
        this.gainNode.disconnect();
    }
}